"use client"

import { useActionState } from "react"
import Link from "next/link"
import { doSocialSignin, signup, type SignupState } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WavyBackground } from "@/components/wavy-background"

import { SiGoogle } from "react-icons/si";
import { AiFillGithub } from 'react-icons/ai'

import {
    Card,
    CardDescription,
    CardTitle,
    CardHeader,
    CardContent,
} from "@/components/ui/card"

const initialState: SignupState = {
    error: "",
    fields: { name: "", surname: "", username: "", email: "" },
}

export default function SignupPage() {
    // useActionState is the only reason this page is a client component:
    // it shows the error from the server action and the pending state
    const [state, formAction, loading] = useActionState(signup, initialState);

    return (
        <main className="flex h-dvh overflow-y-auto isolate p-4 sm:p-6">
            <WavyBackground />

            <Card className="m-auto w-full max-w-md ">
                <CardHeader>
                    <CardTitle>Signup</CardTitle>
                    <CardDescription className="text-color-grey-9000">
                        Create your account NOW
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        action={formAction}
                        className="space-y-4"
                    >

                        <div className="flex space-y-2 flex-row gap-13">
                            <Label htmlFor="name">
                                name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter your name"
                                defaultValue={state.fields.name}
                                required
                            />
                        </div>

                        <div className="flex flex-row gap-9">
                            <Label htmlFor="surname">
                                surname
                            </Label>
                            <Input
                                id="surname"
                                name="surname"
                                placeholder="Enter your surname"
                                defaultValue={state.fields.surname}
                                required
                            />
                        </div>

                        <div className="flex flex-row gap-8">
                            <Label htmlFor="username">
                                username
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Choose a username"
                                defaultValue={state.fields.username}
                                required
                            />
                        </div>

                        <div className="flex flex-row gap-13">
                            <Label htmlFor="email">
                                email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                defaultValue={state.fields.email}
                                required
                            />
                        </div>

                        <div className="flex flex-row gap-8">
                            <Label htmlFor="password">
                                password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="flex flex-row gap-2">
                            <Label htmlFor="confirm_Password">
                                confirm password
                            </Label>
                            <Input
                                id="confirm_Password"
                                name="confirm_Password"
                                type="password"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {state.error && (
                            <div className="rounded-md border border-destructive-50 bg-destructive-10 p-3 text-sm text-destructive">
                                {state.error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}>
                            {loading
                                ? "Signing up..."
                                : "Sign up"
                            }
                        </Button>
                    </form>

                    {/* its own form, because forms can't be nested; the clicked button's value picks the provider */}
                    <form action={doSocialSignin} className="mt-4 space-y-4">
                        <Button
                            type="submit"
                            className="w-50 bg-blue-500 text-white p-1 rounded-md m-1 text-md"
                            name="action"
                            value="google">
                            <SiGoogle /> Sign in With Google
                        </Button>

                        <Button
                            type="submit"
                            className="w-50 bg-blue-500 text-white p-1 rounded-md m-1 text-md"
                            name="action"
                            value="github">
                            <AiFillGithub /> Sign in With GitHub
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            already have an account?{" "}
                            <Link href="/login"
                                className="text-primary hover:underline font-medium">
                                Login
                            </Link>

                        </p>
                    </form>
                </CardContent>
            </Card>
        </main>
    )


}
