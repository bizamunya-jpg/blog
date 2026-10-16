import { Suspense } from "react"
import Hero from "@/components/Hero"
import Posts from "@/components/Posts"

export default function HomePage() {
    return(
        <main id="main">
            <Hero />
            {/* Posts reads the database and the login cookie on every visit, so it streams in after the page shell */}
            <Suspense fallback={<p className="py-10 text-center text-muted-foreground">Loading posts...</p>}>
                <Posts />
            </Suspense>
        </main>
    )

}
