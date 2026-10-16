"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { deletePostAction } from "@/app/actions/posts"

// only rendered for the post's author (see Posts.tsx and the post page).
// onPostPage: after deleting, go to the posts list instead of staying on a page that is gone
export default function DeletePostButton({ postId, title, onPostPage = false }: { postId: number; title: string; onPostPage?: boolean }) {
    const [state, formAction, pending] = useActionState(deletePostAction, { error: "" })

    return (
        <form
            action={formAction}
            onSubmit={(e) => {
                if (!confirm(`Delete "${title}"? This can't be undone.`)) e.preventDefault()
            }}
        >
            <input type="hidden" name="id" value={postId} />
            {onPostPage && <input type="hidden" name="from" value="post-page" />}
            <Button type="submit" variant="destructive" size="sm" disabled={pending}>
                {pending ? "Deleting..." : "Delete"}
            </Button>
            {state.error && (
                <p className="mt-1 text-xs text-destructive">{state.error}</p>
            )}
        </form>
    )
}
