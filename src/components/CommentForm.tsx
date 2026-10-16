"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { addCommentAction } from "@/app/actions/posts"

// box for writing a comment; logged-out visitors get a link to log in instead
export default function CommentForm({ postId, loggedIn }: { postId: number; loggedIn: boolean }) {
    const [state, formAction, pending] = useActionState(addCommentAction, { error: "" })

    if (!loggedIn) {
        return (
            <p className="text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
                {" "}to share your thoughts.
            </p>
        )
    }

    return (
        <form action={formAction} className="space-y-2">
            <input type="hidden" name="postId" value={postId} />
            <Label htmlFor="comment">Your thoughts</Label>
            <textarea
                id="comment"
                name="content"
                required
                maxLength={2000}
                rows={3}
                placeholder="What did you think of this post?"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Posting..." : "Post comment"}
            </Button>
        </form>
    )
}
