import { Suspense } from "react"
import Posts from "@/components/Posts"

// all posts, the same list as on the home page without the hero
export default function PostsPage() {
    return (
        <main id="main">
            <h1 className="mx-auto max-w-7xl px-4 pt-8 text-2xl font-semibold">Posts</h1>
            <Suspense fallback={<p className="py-10 text-center text-muted-foreground">Loading posts...</p>}>
                <Posts />
            </Suspense>
        </main>
    )
}
