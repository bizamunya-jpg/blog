import { z } from "zod";

// Zod schemas for the CRUD features in the README (posts, comments, images).
// Run incoming data through these in server actions / route handlers before it
// reaches Prisma. They never include authorId / uploaderId: who owns a record
// comes from the logged-in session, not from what the browser sends.

// ids arrive as strings from forms and URLs, so coerce them to numbers
export const idSchema = z.coerce.number({ error: "Invalid id" }).int("Invalid id").positive("Invalid id");

const nonEmpty = (label: string, max: number) =>
    z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

// an empty optional text field becomes undefined instead of ""
const optionalText = (label: string, max: number) =>
    z.string().trim().max(max, `${label} must be at most ${max} characters`)
        .transform((value) => value || undefined)
        .optional();

// updates may send any subset of fields, but not nothing at all
const atLeastOneField = (value: object) => Object.keys(value).length > 0;
const NOTHING_TO_UPDATE = "Send at least one field to update";

// ---------- Accounts (Registration page, Login page) ----------

// emails are stored lower-case, so "Ann@Mail.com" and "ann@mail.com" are the same account
const emailField = z.string({ error: "Email is required" }).trim().toLowerCase()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email address"));

export const MIN_PASSWORD_LENGTH = 8;

export const signupSchema = z.object({
    name: nonEmpty("Name", 50),
    surname: nonEmpty("Surname", 50),
    username: nonEmpty("Username", 30),
    email: emailField,
    password: z.string({ error: "Password is required" })
        .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        // bcrypt only uses the first 72 bytes of a password, so longer ones would be cut silently
        .max(72, "Password must be at most 72 characters"),
    confirm_Password: z.string({ error: "Please confirm your password" }),
}).refine((form) => form.password === form.confirm_Password, {
    message: "Passwords do not match",
    path: ["confirm_Password"],
});

// login doesn't re-check password rules: it only needs something to compare
export const loginSchema = z.object({
    email: emailField,
    password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

// ---------- Posts (Blog CRUD) ----------

const postFields = {
    title: nonEmpty("Title", 200),
    brief: optionalText("Brief", 500),
    content: optionalText("Content", 50_000),
    category: optionalText("Category", 50),
};

export const postCreateSchema = z.object({
    ...postFields,
    top: z.boolean().default(false),
    trending: z.boolean().default(false),
});

// no defaults here: a field that isn't sent must stay as it is, not reset to false
export const postUpdateSchema = z.object({
    ...postFields,
    top: z.boolean(),
    trending: z.boolean(),
})
    .partial()
    .refine(atLeastOneField, NOTHING_TO_UPDATE);

// what the create-post page sends: a title and the full text are required there;
// the brief (short summary on cards) is made from the first paragraph of the text
export const postFormSchema = z.object({
    title: nonEmpty("Title", 200),
    content: nonEmpty("Description", 50_000),
});

// pictures uploaded with a post
export const MAX_IMAGES = 4;
export const MAX_IMAGE_MB = 4;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

// what the browser says about each picture before uploading it to Supabase (lib/uploads.ts).
// The bucket itself also refuses other types and bigger files, so this can't be talked around
export const uploadRequestSchema = z.array(z.object({
    type: z.enum(IMAGE_TYPES, "Images must be JPG, PNG, WebP or GIF"),
    size: z.number().int().positive().max(MAX_IMAGE_MB * 1024 * 1024, `Each image must be ${MAX_IMAGE_MB} MB or smaller`),
})).max(MAX_IMAGES, `You can add up to ${MAX_IMAGES} images`);

// the uploaded pictures sent with a new post: their names in the bucket
export const uploadedPathsSchema = z.array(z.string()).max(MAX_IMAGES, `You can add up to ${MAX_IMAGES} images`);

// ---------- Comments (Commenting system, Comment CRUD) ----------

export const commentCreateSchema = z.object({
    postId: idSchema,
    content: nonEmpty("Comment", 2_000),
});

// a comment can only change its text, never move to another post
export const commentUpdateSchema = z.object({
    content: nonEmpty("Comment", 2_000),
});

// ---------- Images (Image CRUD) ----------

// a full web address (https://...) or a path on this site (/uploads/...)
const imageUrl = z.string().trim().min(1, "Image URL is required").refine(
    (value) => value.startsWith("/") || URL.canParse(value),
    "Image URL must be a full web address or start with /",
);

export const imageCreateSchema = z.object({
    url: imageUrl,
    alt: optionalText("Alt text", 200),
    postId: idSchema.optional(),
});

export const imageUpdateSchema = z.object({
    alt: optionalText("Alt text", 200),
    // null detaches the image from its post
    postId: idSchema.nullable().optional(),
}).refine(atLeastOneField, NOTHING_TO_UPDATE);

// ---------- Types for the rest of the app ----------

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostFormInput = z.infer<typeof postFormSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;
export type ImageCreateInput = z.infer<typeof imageCreateSchema>;
export type ImageUpdateInput = z.infer<typeof imageUpdateSchema>;
