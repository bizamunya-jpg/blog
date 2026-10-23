import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { uploadRequestSchema } from "@/lib/schemas";
import type { Result } from "@/lib/posts";

// Uploaded pictures live in Supabase Storage, in the public "post-images" bucket.
// The browser uploads each picture straight to Supabase with a one-time link from
// createUploadLinks, so pictures never pass through our server: Vercel turns away
// requests bigger than 4.5 MB, and its disk is read-only and wiped between requests.
// The bucket's own rules (4 MB, images only) are set by `npm run storage:setup`.
export const BUCKET = "post-images";

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
};

// only names we hand out: the uploader's id, a random id and one of our extensions
const UPLOAD_PATH = /^(\d+)\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;

let bucket: ReturnType<typeof connect> | undefined;

// uses the secret (service role) key, so this must only ever run on the server
function connect() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    return createClient(url, key, { auth: { persistSession: false } }).storage.from(BUCKET);
}

function storage() {
    bucket ??= connect();
    return bucket;
}

export type UploadLink = { path: string; signedUrl: string };

// one upload link per picture the browser is about to send. Each link only works
// for its own random name, inside the folder of the person who asked for it
export async function createUploadLinks(userId: number | null, files: unknown): Promise<Result<UploadLink[]>> {
    if (userId === null) return { ok: false, error: "You need to log in first", status: 401 };

    const parsed = uploadRequestSchema.safeParse(files);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message, status: 400 };

    const links: UploadLink[] = [];
    for (const file of parsed.data) {
        const path = `${userId}/${randomUUID()}.${EXTENSIONS[file.type]}`;
        const { data, error } = await storage().createSignedUploadUrl(path);
        if (error) throw error;
        links.push({ path, signedUrl: data.signedUrl });
    }
    return { ok: true, data: links };
}

// true when the picture was uploaded by this user with one of our links and really arrived
export async function isOwnUpload(userId: number, path: string) {
    const match = UPLOAD_PATH.exec(path);
    if (!match || Number(match[1]) !== userId) return false;
    const { data } = await storage().exists(path);
    return data === true;
}

// the address saved on the post and given to next/image
export function uploadUrl(path: string) {
    return storage().getPublicUrl(path).data.publicUrl;
}

// removes uploaded pictures by their saved address; quietly ignores anything else
// (like the starter pictures in src/pictures)
export async function deleteUploads(urls: string[]) {
    const prefix = uploadUrl("");
    const paths = urls
        .filter((url) => url.startsWith(prefix))
        .map((url) => url.slice(prefix.length))
        .filter((path) => UPLOAD_PATH.test(path));
    if (paths.length > 0) await storage().remove(paths);
}
