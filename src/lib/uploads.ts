import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploaded pictures are saved in <project>/uploads and served by the
// /uploads/[name] route (src/app/uploads/[name]/route.ts).
// They live outside public/ because a production server only serves the
// public/ files that existed when the site was built.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
};

export const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
    Object.entries(EXTENSIONS).map(([type, ext]) => [ext, type]),
);

// only names we generate: a random id and one of our extensions. This is what
// stops a request like /uploads/../.env from reading other files
const SAFE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;

export function isSafeUploadName(name: string) {
    return SAFE_NAME.test(name);
}

// saves the file under a random name and returns the web address to store on the post
export async function saveUpload(file: File): Promise<string> {
    const extension = EXTENSIONS[file.type];
    if (!extension) throw new Error(`Unsupported image type: ${file.type}`);

    const name = `${randomUUID()}.${extension}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
}

// removes a saved upload by its web address; quietly ignores anything else
export async function deleteUpload(url: string) {
    const name = url.replace(/^\/uploads\//, "");
    if (!isSafeUploadName(name)) return;
    await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
}

export async function readUpload(name: string) {
    if (!isSafeUploadName(name)) return null;
    return readFile(path.join(UPLOAD_DIR, name)).catch(() => null);
}
