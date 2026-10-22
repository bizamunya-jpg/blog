import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Heart, MessageCircle } from "lucide-react"
import { getProfile } from "@/lib/profiles"
import { isFollowing } from "@/lib/follows"
import { resolvePicture } from "@/lib/pictures"
import FollowButton from "@/components/FollowButton"
import DeletePostButton from "@/components/DeletePostButton"
import DeleteCommentButton from "@/components/DeleteCommentButton"

// one person's page: their details, counts, posts and comments.
// Used by /user (your own page) and /user/[id] (anyone's page)
export default async function UserProfile({ userId, viewerId }: { userId: unknown; viewerId: number | null }) {
    const user = await getProfile(userId, viewerId)
    if (!user) notFound()

    const isOwnPage = user.id === viewerId
    const following = isOwnPage ? false : await isFollowing(viewerId, user.id)

    const stats = [
        { label: user._count.posts === 1 ? "Post" : "Posts", value: user._count.posts },
        { label: user._count.followers === 1 ? "Follower" : "Followers", value: user._count.followers },
        { label: "Following", value: user._count.following },
        { label: user._count.comments === 1 ? "Comment" : "Comments", value: user._count.comments },
    ]

    return (
        <div className="space-y-10">
            <section aria-labelledby="user-heading" className="rounded-xl border p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            aria-hidden="true"
                            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xl font-semibold uppercase text-white"
                        >
                            {user.name[0]}{user.surname[0]}
                        </div>
                        <div>
                            <h1 id="user-heading" className="text-2xl font-semibold">
                                {user.name} {user.surname}
                            </h1>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                            {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                            <p className="text-xs text-muted-foreground">
                                Joined {user.createdAt.toLocaleDateString("en-GB")}
                            </p>
                        </div>
                    </div>
                    {!isOwnPage && (
                        <FollowButton userId={user.id} following={following} loggedIn={viewerId !== null} />
                    )}
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-lg bg-muted p-3 text-center">
                            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                            <dd className="text-2xl font-semibold">{stat.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section aria-labelledby="posts-heading">
                <h2 id="posts-heading" className="text-xl font-semibold">
                    {isOwnPage ? "Your posts" : "Posts"} ({user.posts.length})
                </h2>
                {user.posts.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                        {isOwnPage ? (
                            <>No posts yet. <Link href="/create_posts" className="text-primary hover:underline">Create one</Link>.</>
                        ) : (
                            "No posts yet."
                        )}
                    </p>
                ) : (
                    <ul className="mt-4 grid gap-6 sm:grid-cols-2">
                        {user.posts.map((post) => {
                            const picture = post.images[0]
                            return (
                                <li key={post.id} className="flex flex-col overflow-hidden rounded-xl border">
                                    <Link href={`/Posts/${post.id}`} className="group flex flex-1 flex-col">
                                        {picture && (
                                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                                <Image
                                                    src={resolvePicture(picture.url)}
                                                    alt={picture.alt ?? ""}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, 384px"
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-1 flex-col p-5 pb-0">
                                            <h3 className="text-lg font-semibold leading-snug group-hover:underline">{post.title}</h3>
                                            {post.brief && (
                                                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.brief}</p>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="flex items-end justify-between gap-3 p-5 pt-4">
                                        <p className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{post.createdAt.toLocaleDateString("en-GB")}</span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="size-3.5" aria-hidden="true" />
                                                {post._count.likes}
                                                <span className="sr-only">likes</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="size-3.5" aria-hidden="true" />
                                                {post._count.comments}
                                                <span className="sr-only">comments</span>
                                            </span>
                                        </p>
                                        {isOwnPage && <DeletePostButton postId={post.id} title={post.title} />}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            <section aria-labelledby="comments-heading">
                <h2 id="comments-heading" className="text-xl font-semibold">
                    {isOwnPage ? "Your comments" : "Comments"} ({user.comments.length})
                </h2>
                {user.comments.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                    <ul className="mt-4 space-y-4">
                        {user.comments.map((comment) => (
                            <li key={comment.id} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm text-muted-foreground">
                                        On{" "}
                                        <Link href={`/Posts/${comment.post.id}`} className="font-medium text-foreground hover:underline">
                                            {comment.post.title}
                                        </Link>
                                        {" · "}{comment.createdAt.toLocaleDateString("en-GB")}
                                    </p>
                                    {isOwnPage && <DeleteCommentButton commentId={comment.id} />}
                                </div>
                                <p className="mt-2 whitespace-pre-line text-sm">{comment.content}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
