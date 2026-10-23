"use server"

import { refresh, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUserId } from "@/lib/session"
import { createPostWithImages, deletePost } from "@/lib/posts"
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

export type CreatePostState = {
    error: string
    // sent back so the form keeps what was typed when something is wrong
    fields: { title: string; content: string }
}

export async function createPostAction(_previous: CreatePostState, formData: FormData): Promise<CreatePostState> {
    const fields = {
        title: String(formData.get("title") ?? ""),
        content: String(formData.get("content") ?? ""),
    }
    const images = formData.getAll("images").filter((value) => value instanceof File && value.size > 0)

    const result = await createPostWithImages(await getCurrentUserId(), fields, images)
    if (!result.ok) return { error: result.error, fields }

    // the new post shows on Posts, Home and the User page; without this the browser keeps
    // showing the copies it already had from before the post existed
    revalidatePath("/", "layout")
    redirect(`/Posts/${result.data.id}`)
}
