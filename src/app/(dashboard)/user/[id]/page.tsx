import { Suspense } from "react"
import { getCurrentUserId } from "@/lib/session"
import UserProfile from "@/components/UserProfile"

// anyone's page, opened from an author's name on a post or comment
export default function OtherUserPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <main id="main" className="mx-auto w-full max-w-4xl px-4 py-8">
            {/* the user id is only known when someone visits, so the page streams in */}
            <Suspense fallback={<p className="py-10 text-center text-muted-foreground">Loading...</p>}>
                <Profile params={params} />
            </Suspense>
        </main>
    )
}

async function Profile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <UserProfile userId={id} viewerId={await getCurrentUserId()} />
}
