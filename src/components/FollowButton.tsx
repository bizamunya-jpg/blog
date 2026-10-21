"use client"

import Link from "next/link"
import { useOptimistic, useState, useTransition } from "react"
import { UserCheck, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleFollowAction } from "@/app/actions/users"

type Props = {
    userId: number
    following: boolean
    loggedIn: boolean
}

// follow / unfollow button on someone else's User page. Like the LikeButton, it flips
// straight away and the server confirms in the background
export default function FollowButton({ userId, following, loggedIn }: Props) {
    const [optimistic, setOptimistic] = useOptimistic(following)
    const [error, setError] = useState("")
    const [, startTransition] = useTransition()

    if (!loggedIn) {
        return (
            <Button variant="outline" size="sm" render={<Link href="/login" />} nativeButton={false}>
                <UserPlus aria-hidden="true" />
                Log in to follow
            </Button>
        )
    }

    function handleClick() {
        setError("")
        startTransition(async () => {
            setOptimistic(!optimistic)
            const result = await toggleFollowAction(userId)
            if (result.error) setError(result.error)
        })
    }

    return (
        <div>
            <Button
                variant={optimistic ? "outline" : "default"}
                size="sm"
                onClick={handleClick}
                aria-pressed={optimistic}
            >
                {optimistic ? <UserCheck aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
                {optimistic ? "Following" : "Follow"}
            </Button>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    )
}
