"use server"

import { cookies } from "next/headers"
import { signOut } from "@/app/lib/auth"
import { SESSION_COOKIE } from "@/lib/session"

// logs out of both ways of signing in: the email/password session cookie
// and the Auth.js (Google / GitHub) session, then goes to the login page
export async function logout() {
    (await cookies()).delete(SESSION_COOKIE)
    await signOut({ redirectTo: "/login" })
}
