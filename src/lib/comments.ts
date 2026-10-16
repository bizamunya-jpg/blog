import "server-only";
import { prisma } from "@/lib/prisma";
import { commentCreateSchema, idSchema } from "@/lib/schemas";
import type { Result } from "@/lib/posts";

// Comment rules (README: Commenting system, Comment CRUD):
// - any logged-in user can comment on a post; the comment is saved as theirs
// - anyone can read comments (they come with getPost)
// - only the person who wrote a comment can delete it

const NOT_LOGGED_IN = { ok: false, error: "You need to log in to comment", status: 401 } as const;

export async function createComment(userId: number | null, input: unknown) {
    if (userId === null) return NOT_LOGGED_IN;

    const parsed = commentCreateSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0].message, status: 400 } as const;
    }

    const postExists = await prisma.post.count({ where: { id: parsed.data.postId } });
    if (!postExists) return { ok: false, error: "Post not found", status: 404 } as const;

    const comment = await prisma.comment.create({
        data: { ...parsed.data, authorId: userId },
    });
    return { ok: true, data: comment } as const;
}

export async function deleteComment(userId: number | null, id: unknown): Promise<Result<{ id: number }>> {
    if (userId === null) return NOT_LOGGED_IN;

    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return { ok: false, error: "Comment not found", status: 404 };

    // the authorId condition is what makes this owner-only
    const { count } = await prisma.comment.deleteMany({
        where: { id: parsedId.data, authorId: userId },
    });
    if (count === 1) return { ok: true, data: { id: parsedId.data } };

    const exists = await prisma.comment.count({ where: { id: parsedId.data } });
    return exists
        ? { ok: false, error: "You can only delete your own comments", status: 403 }
        : { ok: false, error: "Comment not found", status: 404 };
}
