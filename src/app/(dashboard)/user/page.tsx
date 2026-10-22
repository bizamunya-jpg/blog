import { Suspense } from "react"
import Link from "next/link"
import { getCurrentUserId } from "@/lib/session"
import UserProfile from "@/components/UserProfile"

// the logged-in person's own page
export default function UserPage() {
    return (
        <main id="main" className="mx-auto w-full max-w-4xl px-4 py-8">
            {/* who is logged in is only known when someone visits */}
            <Suspense fallback={<p className="py-10 text-center text-muted-foreground">Loading...</p>}>
                <OwnProfile />
            </Suspense>
        </main>
    )
}

async function OwnProfile() {
    const userId = await getCurrentUserId()
    if (userId === null) {
        return (
            <p className="rounded-lg border p-6 text-center">
                <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
                {" "}to see your page.
            </p>
        )
    }
    return <UserProfile userId={userId} viewerId={userId} />
}
