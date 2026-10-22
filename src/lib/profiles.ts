import "server-only";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";

// everything the User page shows about one person: their details, how many posts,
// followers, following and comments they have, their posts and their comments.
// The email is only included when someone is looking at their own page.
export async function getProfile(id: unknown, viewerId: number | null) {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return null;

    const user = await prisma.user.findUnique({
        where: { id: parsedId.data },
        select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            createdAt: true,
            _count: { select: { posts: true, followers: true, following: true, comments: true } },
            posts: {
                orderBy: { createdAt: "desc" },
                include: {
                    images: { take: 1, orderBy: { createdAt: "asc" }, select: { id: true, url: true, alt: true } },
                    _count: { select: { comments: true, likes: true } },
                },
            },
            comments: {
                orderBy: { createdAt: "desc" },
                include: { post: { select: { id: true, title: true } } },
            },
        },
    });
    if (!user) return null;

    const { email, ...rest } = user;
    return { ...rest, email: user.id === viewerId ? email : null };
}
