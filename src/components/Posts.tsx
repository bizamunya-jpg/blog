import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle } from 'lucide-react'
import { listPosts } from '@/lib/posts'
import { getCurrentUserId } from '@/lib/session'
import { resolvePicture } from '@/lib/pictures'
import DeletePostButton from '@/components/DeletePostButton'

// every post, newest first. Anyone can read them; the delete button
// only shows on posts written by the person who is logged in
export default async function Posts() {
    // read the login cookie first: that tells Next.js this list depends on the visitor,
    // so it renders on every request instead of being pre-rendered with the query
    const currentUserId = await getCurrentUserId()
    const posts = await listPosts()

    if (posts.length === 0) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-10 text-center text-muted-foreground">
                No posts yet.
            </section>
        )
    }

    return (
        <section id="posts" className="mx-auto max-w-7xl px-4 py-10">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => {
                    const picture = post.images[0]
                    return (
                        <li key={post.id} className="flex flex-col overflow-hidden rounded-xl border">
                            {/* the picture and the text both open the post */}
                            <Link href={`/Posts/${post.id}`} className="group flex flex-1 flex-col">
                                {picture && (
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        <Image
                                            src={resolvePicture(picture.url)}
                                            alt={picture.alt ?? ""}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <div className="flex flex-1 flex-col p-5 pb-0">
                                    {post.category && (
                                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {post.category}
                                        </span>
                                    )}
                                    <h3 className="mt-1 text-lg font-semibold leading-snug group-hover:underline">{post.title}</h3>
                                    {post.brief && (
                                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.brief}</p>
                                    )}
                                </div>
                            </Link>

                            <div className="flex items-end justify-between gap-3 p-5 pt-4">
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <p>by <Link href={`/user/${post.author.id}`} className="hover:text-foreground hover:underline">{post.author.username}</Link> · {post.createdAt.toLocaleDateString("en-GB")}</p>
                                    <p className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Heart className="size-3.5" aria-hidden="true" />
                                            {post._count.likes} {post._count.likes === 1 ? "like" : "likes"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="size-3.5" aria-hidden="true" />
                                            {post._count.comments} {post._count.comments === 1 ? "comment" : "comments"}
                                        </span>
                                    </p>
                                </div>

                                {post.authorId === currentUserId && (
                                    <DeletePostButton postId={post.id} title={post.title} />
                                )}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
