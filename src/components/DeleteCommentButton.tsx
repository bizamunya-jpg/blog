"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { deleteCommentAction } from "@/app/actions/posts"

// only rendered on comments written by the person who is logged in
export default function DeleteCommentButton({ commentId }: { commentId: number }) {
    const [state, formAction, pending] = useActionState(deleteCommentAction, { error: "" })

    return (
        <form
            action={formAction}
            onSubmit={(e) => {
                if (!confirm("Delete your comment?")) e.preventDefault()
            }}
        >
            <input type="hidden" name="id" value={commentId} />
            <Button type="submit" variant="ghost" size="xs" disabled={pending} className="text-destructive">
                {pending ? "Deleting..." : "Delete"}
            </Button>
            {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        </form>
    )
}
