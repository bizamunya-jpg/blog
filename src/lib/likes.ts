import "server-only";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";
import type { Result } from "@/lib/posts";

// Like rules: any logged-in user can like a post once; liking again takes the like back.
// The hero shows the most-liked posts (see lib/hero.ts).

export async function hasLiked(userId: number | null, postId: number) {
    if (userId === null) return false;
    return (await prisma.like.count({ where: { userId, postId } })) > 0;
}

export async function toggleLike(userId: number | null, postId: unknown): Promise<Result<{ liked: boolean }>> {
    if (userId === null) return { ok: false, error: "You need to log in to like posts", status: 401 };

    const parsedId = idSchema.safeParse(postId);
    if (!parsedId.success) return { ok: false, error: "Post not found", status: 404 };

    const where = { postId_userId: { postId: parsedId.data, userId } };
    const existing = await prisma.like.findUnique({ where });
    if (existing) {
        await prisma.like.delete({ where });
        return { ok: true, data: { liked: false } };
    }

    const postExists = await prisma.post.count({ where: { id: parsedId.data } });
    if (!postExists) return { ok: false, error: "Post not found", status: 404 };

    // a double click can race the check above; the unique rule makes the second one a no-op
    await prisma.like.upsert({ where, create: { postId: parsedId.data, userId }, update: {} });
    return { ok: true, data: { liked: true } };
}
