import "server-only";
import { prisma } from "@/lib/prisma";
import { idSchema, imageCreateSchema } from "@/lib/schemas";
import type { Result } from "@/lib/posts";

// Image rules (README: Image CRUD):
// - any logged-in user can add an image; it is saved as theirs
// - an image can only be attached to a post the same user created
// - anyone can read images
// - only the person who added an image can delete it

const NOT_LOGGED_IN = {
    ok: false,
    error: "You need to log in first",
    status: 401
} as const;

export async function createImage(
    userId: number | null,
    input: unknown) {
    if (userId === null) return NOT_LOGGED_IN;

    const parsed = imageCreateSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0].message, status: 400 } as const;
    }

    const { postId } = parsed.data;
    if (postId !== undefined) {
        const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
        if (!post) return {
            ok: false,
            error: "Post not found",

            status: 404
        } as const;
        if (post.authorId !== userId) {
            return {
                ok: false,
                error: "You can only add images to your own posts",
                status: 403
            } as const;
        }
    }

    const image = await prisma.image.create({
        data: { ...parsed.data, uploaderId: userId },
    });
    return {
        ok: true,
        data: image
    } as const;
}

// all images, or only the ones on one post
export async function listImages(postId?: unknown) {
    const parsedPostId = postId === undefined ? undefined : idSchema.safeParse(postId);
    if (parsedPostId && !parsedPostId.success) return [];

    return prisma.image.findMany({
        where: parsedPostId ? { postId: parsedPostId.data } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
            uploader: {
                select: {
                    id: true,
                    username: true
                }
            }
        },
    });
}

export async function getImage(id: unknown) {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return null;

    return prisma.image.findUnique({
        where: { id: parsedId.data },
        include: {
            uploader: {
                select: {
                    id: true,
                    username: true
                }
            }
        },
    });
}

export async function deleteImage(userId: number | null, id: unknown): Promise<Result<{ id: number }>> {
    if (userId === null) return NOT_LOGGED_IN;

    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return {
        ok: false,
        error: "Image not found",
        status: 404
    };

    // the uploaderId condition is what makes this owner-only
    const { count } = await prisma.image.deleteMany({
        where: { id: parsedId.data, uploaderId: userId },
    });
    if (count === 1) return { ok: true, data: { id: parsedId.data } };

    const exists = await prisma.image.count({ where: { id: parsedId.data } });
    return exists
        ? {
            ok: false,
            error: "You can only delete your own images",
            status: 403
        }
        : {
            ok: false,
            error: "Image not found",
            status: 404
        };
}
