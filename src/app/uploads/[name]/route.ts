import { CONTENT_TYPES, readUpload } from "@/lib/uploads"

// serves a picture uploaded with a post, e.g. /uploads/1b9d...e2.jpg
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
    const { name } = await params
    const file = await readUpload(name)
    if (!file) return new Response("Not found", { status: 404 })

    return new Response(new Uint8Array(file), {
        headers: {
            "Content-Type": CONTENT_TYPES[name.split(".").pop()!],
            // the name is random and never reused, so browsers can keep it for a long time
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    })
}
