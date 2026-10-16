import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getPost } from "@/lib/posts"
import { hasLiked } from "@/lib/likes"
import { getCurrentUserId } from "@/lib/session"
import { resolvePicture } from "@/lib/pictures"
import LikeButton from "@/components/LikeButton"
import CommentForm from "@/components/CommentForm"
import DeleteCommentButton from "@/components/DeleteCommentButton"
import DeletePostButton from "@/components/DeletePostButton"

// one post: its pictures, full text, likes and comments
export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
            <Link href="/Posts" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" aria-hidden="true" />
                All posts
            </Link>
            {/* the post id is only known when someone visits, so the post streams in */}
            <Suspense fallback={<p className="py-10 text-center text-muted-foreground">Loading post...</p>}>
                <PostView params={params} />
            </Suspense>
        </main>
    )
}

async function PostView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const currentUserId = await getCurrentUserId()
    const post = await getPost(id)
    if (!post) notFound()

    const liked = await hasLiked(currentUserId, post.id)
    const [cover, ...otherPictures] = post.images
    const paragraphs = (post.content ?? post.brief ?? "").split(/\n\s*\n/).filter(Boolean)

    return (
        <article>
            {cover && (
                <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl bg-muted">
                    <Image
                        src={resolvePicture(cover.url)}
                        alt={cover.alt ?? ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        loading="eager"
                        fetchPriority="high"
                        className="object-cover"
                    />
                </div>
            )}

            {post.category && (
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{post.category}</span>
            )}
            <h1 className="mt-1 text-3xl font-semibold leading-tight">{post.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                by {post.author.username} · {post.createdAt.toLocaleDateString("en-GB")}
            </p>

            <div className="mt-4 flex items-center gap-3 text-black">
                <LikeButton
                    postId={post.id}
                    liked={liked}
                    count={post._count.likes}
                    loggedIn={currentUserId !== null}
                />
                {post.authorId === currentUserId && (
                    <DeletePostButton 
                    postId={post.id} 
                    title={post.title} 
                    onPostPage />
                )}
            </div>

            <div className="mt-6 space-y-4 leading-relaxed">
                {paragraphs.map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line">{paragraph}</p>
                ))}
            </div>

            {otherPictures.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {otherPictures.map((picture) => (
                        <div key={picture.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                            <Image 
                            src={resolvePicture(picture.url)} 
                            alt={picture.alt ?? ""} 
                            fill sizes="250px" 
                            className="object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <section aria-labelledby="comments-heading" className="mt-10 border-t pt-6">
                <h2 id="comments-heading" className="text-xl font-semibold">
                    Comments ({post.comments.length})
                </h2>

                <div className="mt-4">
                    <CommentForm postId={post.id} loggedIn={currentUserId !== null} />
                </div>

                {post.comments.length === 0 ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                        No comments yet. Be the first to share your thoughts.
                        </p>
                ) : (
                    <ul className="mt-6 space-y-4">
                        {post.comments.map((comment) => (
                            <li key={comment.id} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-medium">
                                        {comment.author.username}
                                        <span className="ml-2 font-normal text-muted-foreground">
                                            {comment.createdAt.toLocaleDateString("en-GB")}
                                        </span>
                                    </p>
                                    {comment.authorId === currentUserId && (
                                        <DeleteCommentButton commentId={comment.id} />
                                    )}
                                </div>
                                <p className="mt-2 whitespace-pre-line text-sm">{comment.content}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </article>
    )
}
