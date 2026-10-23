import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Run once with `npm run storage:setup` (and again if the rules below change).
// Creates the public Supabase Storage bucket that post pictures are uploaded to
// (src/lib/uploads.ts), and makes the bucket itself refuse anything that isn't a
// JPG, PNG, WebP or GIF of 4 MB or less, matching MAX_IMAGE_MB and IMAGE_TYPES in lib/schemas.ts.

const BUCKET = "post-images";
const rules = {
    public: true, // anyone can see the pictures; only our upload links can add them
    fileSizeLimit: "4MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

async function main() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env first");

    const storage = createClient(url, key, { auth: { persistSession: false } }).storage;

    const { data: existing } = await storage.getBucket(BUCKET);
    const { error } = existing
        ? await storage.updateBucket(BUCKET, rules)
        : await storage.createBucket(BUCKET, rules);
    if (error) throw error;

    console.log(`Bucket "${BUCKET}" is ready (${existing ? "updated" : "created"})`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
