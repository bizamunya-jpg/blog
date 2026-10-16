"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUserId } from "@/lib/session"
import { deletePost } from "@/lib/posts"
import { createComment, deleteComment } from "@/lib/comments"
import { toggleLike } from "@/lib/likes"

export type ActionState = { error: string }

// the button is only shown to the post's author, but this still checks:
// deletePost refuses anyone who isn't the author, whatever the browser sends
export async function deletePostAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
    const userId = await getCurrentUserId()
    const result = await deletePost(userId, formData.get("id"))

    if (!result.ok) return { error: result.error }

    // deleting from the post's own page: that page no longer exists, so go to the list
    if (formData.get("from") === "post-page") redirect("/Posts")

    refresh()
    return { error: "" }
}

export async function toggleLikeAction(postId: number): Promise<ActionState> {
    const result = await toggleLike(await getCurrentUserId(), postId)
    if (!result.ok) return { error: result.error }

    refresh()
    return { error: "" }
}

export async function addCommentAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
    const result = await createComment(await getCurrentUserId(), {
        postId: formData.get("postId"),
        content: formData.get("content"),
    })
    if (!result.ok) return { error: result.error }

    refresh()
    return { error: "" }
}

// like posts: the delete button only shows on your own comments, and this checks again
export async function deleteCommentAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
    const result = await deleteComment(await getCurrentUserId(), formData.get("id"))
    if (!result.ok) return { error: result.error }

    refresh()
    return { error: "" }
}
