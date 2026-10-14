"use client"

import { useActionState } from "react"
import Link from "next/link"
import { doSocialSignin, logIn, type LoginState } from "@/app/actions/auth"
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

const initialState: LoginState = {
    error: "",
    email: "",
}

export default function LoginPage() {
    // useActionState is the only reason this page is a client component:
    // it shows the error from the server action and the pending state
    const [state, formAction, loading] = useActionState(logIn, initialState);

    return (
        <main className="flex h-screen overflow-y-auto isolate p-4 sm:p-6">
            <WavyBackground />

            <Card className="m-auto w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Welcome back, log in to your account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        action={formAction}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                defaultValue={state.email}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
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
                                ? "Logging in..."
                                : "Login"
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
                            don&apos;t have an account?{" "}
                            <Link href="/registration"
                                className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}
