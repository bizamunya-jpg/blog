"use server"

import { redirect } from "next/navigation"
import { signIn} from "@/app/lib/auth"
import { createUser } from "@/lib/users"
import { login } from "@/lib/login"

export type SignupState = {
    error: string;
    // sent back so the form keeps what was typed; passwords are never sent back
    fields: { name: string; surname: string; username: string; email: string };
}

export async function signup(_previous: SignupState, formData: FormData): Promise<SignupState> {
    const body = Object.fromEntries(formData)
    const result = await createUser(body)

    if (!result.ok) {
        return {
            error: result.error,
            fields: {
                name: String(body.name ?? ""),
                surname: String(body.surname ?? ""),
                username: String(body.username ?? ""),
                email: String(body.email ?? ""),
            },
        }
    }

    redirect("/login")
}

export type LoginState = {
    error: string;
    email: string;
}

export async function logIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
    const body = Object.fromEntries(formData)
    const result = await login(body)

    if (!result.ok) {
        return { error: result.error, email: String(body.email ?? "") }
    }

    redirect("/home")
}

export async function doSocialSignin (formData: FormData) {

    const action = String(formData.get('action'));
    await signIn(action, { redirectTo: "/home"})
}

export async function doSignout() {

}
