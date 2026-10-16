import { Suspense } from "react"
import Link from "next/link"
import { getCurrentUserId } from "@/lib/session"
import CreatePostForm from "@/components/CreatePostForm"

export default function CreatePostPage() {
    return (
        <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-semibold">Create a post</h1>
            <p className="mt-1 text-sm text-muted-foreground">Add some pictures, a title and what you want to say.</p>
            <div className="mt-6">
                {/* who is logged in is only known when someone visits */}
                <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
                    <FormOrLogin />
                </Suspense>
            </div>
        </main>
    )
}

async function FormOrLogin() {
    const userId = await getCurrentUserId()
    if (userId === null) {
        return (
            <p className="rounded-lg border p-6 text-center">
                <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
                {" "}to create a post.
            </p>
        )
    }
    return <CreatePostForm />
}
