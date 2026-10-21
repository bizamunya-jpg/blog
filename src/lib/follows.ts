import "server-only";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";
import type { Result } from "@/lib/posts";

// Follow rules: any logged-in user can follow another user once; following again
// takes it back. Nobody can follow themselves.

export async function isFollowing(followerId: number | null, followingId: number) {
    if (followerId === null) return false;
    return (await prisma.follow.count({ where: { followerId, followingId } })) > 0;
}

export async function toggleFollow(userId: number | null, targetId: unknown): Promise<Result<{ following: boolean }>> {
    if (userId === null) return { ok: false, error: "You need to log in to follow people", status: 401 };

    const parsedId = idSchema.safeParse(targetId);
    if (!parsedId.success) return { ok: false, error: "User not found", status: 404 };
    if (parsedId.data === userId) return { ok: false, error: "You can't follow yourself", status: 400 };

    const where = { followerId_followingId: { followerId: userId, followingId: parsedId.data } };
    const existing = await prisma.follow.findUnique({ where });
    if (existing) {
        await prisma.follow.delete({ where });
        return { ok: true, data: { following: false } };
    }

    const userExists = await prisma.user.count({ where: { id: parsedId.data } });
    if (!userExists) return { ok: false, error: "User not found", status: 404 };

    // a double click can race the check above; the unique rule makes the second one a no-op
    await prisma.follow.upsert({ where, create: { followerId: userId, followingId: parsedId.data }, update: {} });
    return { ok: true, data: { following: true } };
}
