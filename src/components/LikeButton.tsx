"use client"

import Link from "next/link"
import { useOptimistic, useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleLikeAction } from "@/app/actions/posts"

type Props = {
    postId: number
    liked: boolean
    count: number
    loggedIn: boolean
}

// heart button with the like count. It flips straight away on click and the
// server confirms in the background; logged-out visitors are sent to log in
export default function LikeButton({ postId, liked, count, loggedIn }: Props) {
    const [optimistic, setOptimistic] = useOptimistic({ liked, count })
    const [error, setError] = useState("")
    const [, startTransition] = useTransition()

    const label = `${optimistic.count} ${optimistic.count === 1 ? "like" : "likes"}`

    if (!loggedIn) {
        return (
            <Button variant="outline" size="sm" render={<Link href="/login" />} nativeButton={false}>
                <Heart aria-hidden="true" />
                {label} · Log in to like
            </Button>
        )
    }

    function handleClick() {
        setError("")
        startTransition(async () => {
            setOptimistic({
                liked: !optimistic.liked,
                count: optimistic.count + (optimistic.liked ? -1 : 1),
            })
            const result = await toggleLikeAction(postId)
            if (result.error) setError(result.error)
        })
    }

    return (
        <div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                aria-pressed={optimistic.liked}
                aria-label={optimistic.liked ? `Unlike (${label})` : `Like (${label})`}
            >
                <Heart
                    aria-hidden="true"
                    className={optimistic.liked ? "fill-red-500 text-red-500" : undefined}
                />
                {label}
            </Button>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    )
}
