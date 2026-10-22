import "server-only";
import { prisma } from "@/lib/prisma";
import { idSchema, imageFilesSchema, postCreateSchema, postFormSchema } from "@/lib/schemas";
import { deleteUpload, saveUpload } from "@/lib/uploads";

// Post rules (README: Blog CRUD):
// - any logged-in user can create a post; it is saved as theirs
// - anyone can read posts
// - only the person who created a post can delete it

export type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: string; status: number };

const NOT_LOGGED_IN = { ok: false, error: "You need to log in first", status: 401 } as const;

// what we show about an author; never the password or email
const authorFields = { select: { id: true, username: true, name: true, surname: true } } as const;

export async function createPost(userId: number | null, input: unknown) {
    if (userId === null) return NOT_LOGGED_IN;

    const parsed = postCreateSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0].message, status: 400 } as const;
    }

    const post = await prisma.post.create({
        data: { ...parsed.data, authorId: userId },
    });
    return { ok: true, data: post } as const;
}

export async function listPosts() {
    return prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            author: authorFields,
            images: { take: 1, orderBy: { createdAt: "asc" }, select: { id: true, url: true, alt: true } },
            _count: { select: { comments: true, likes: true } },
        },
    });
}

export async function getPost(id: unknown) {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return null;

    return prisma.post.findUnique({
        where: { id: parsedId.data },
        include: {
            author: authorFields,
            images: { orderBy: { createdAt: "asc" }, select: { id: true, url: true, alt: true } },
            _count: { select: { likes: true } },
            comments: {
                orderBy: { createdAt: "asc" },
                include: { author: authorFields },
            },
        },
    });
}

export async function deletePost(userId: number | null, id: unknown): Promise<Result<{ id: number }>> {
    if (userId === null) return NOT_LOGGED_IN;

    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return { ok: false, error: "Post not found", status: 404 };

    // its pictures, so they can be removed along with it (only matches if it's the user's post)
    const images = await prisma.image.findMany({
        where: { postId: parsedId.data, post: { authorId: userId } },
        select: { id: true, url: true },
    });

    // the authorId condition is what makes this owner-only: someone else's post simply doesn't match
    const { count } = await prisma.post.deleteMany({
        where: { id: parsedId.data, authorId: userId },
    });
    if (count === 1) {
        await prisma.image.deleteMany({ where: { id: { in: images.map((image) => image.id) } } });
        await Promise.all(images.map((image) => deleteUpload(image.url)));
        return { ok: true, data: { id: parsedId.data } };
    }

    const exists = await prisma.post.count({ where: { id: parsedId.data } });
    return exists
        ? { ok: false, error: "You can only delete your own posts", status: 403 }
        : { ok: false, error: "Post not found", status: 404 };
}

// the first paragraph of the text, shortened, for the cards and the hero
function makeBrief(content: string) {
    const first = content.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
    return first.length > 200 ? `${first.slice(0, 197).trimEnd()}...` : first;
}

// used by the create-post page: title, description and up to MAX_IMAGES pictures
export async function createPostWithImages(userId: number | null, input: unknown, files: unknown) {
    if (userId === null) return NOT_LOGGED_IN;

    const fields = postFormSchema.safeParse(input);
    if (!fields.success) {
        return { ok: false, error: fields.error.issues[0].message, status: 400 } as const;
    }
    const images = imageFilesSchema.safeParse(files);
    if (!images.success) {
        return { ok: false, error: images.error.issues[0].message, status: 400 } as const;
    }

    const { title, content } = fields.data;
    const urls: string[] = [];
    try {
        for (const file of images.data) urls.push(await saveUpload(file));

        const post = await prisma.post.create({
            data: {
                title,
                content,
                brief: makeBrief(content),
                authorId: userId,
                images: { create: urls.map((url) => ({ url, alt: title, uploaderId: userId })) },
            },
        });
        return { ok: true, data: post } as const;
    } catch (error) {
        // don't leave pictures behind for a post that was never saved
        await Promise.all(urls.map(deleteUpload));
        throw error;
    }
}
