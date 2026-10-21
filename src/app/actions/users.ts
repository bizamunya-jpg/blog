"use server"

import { refresh } from "next/cache"
import { getCurrentUserId } from "@/lib/session"
import { toggleFollow } from "@/lib/follows"
import type { ActionState } from "@/app/actions/posts"

export async function toggleFollowAction(userId: number): Promise<ActionState> {
    const result = await toggleFollow(await getCurrentUserId(), userId)
    if (!result.ok) return { error: result.error }

    refresh()
    return { error: "" }
}
