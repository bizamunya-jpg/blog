import { Suspense } from 'react';
import Link from 'next/link';
import Nav from '@/components/nav';

export default function Header() {
    return (
        <header id="header" className="sticky top-0 z-40 w-full bg-stone-300">
            <div className="mx-auto flex h-15 max-w-7xl items-center justify-between px-4">
                <Link href="/" className="logo flex items-center">
                    {/* <image src="" alt="" /> */}
                    <h1 className="text-xl font-semibold">Blog Me</h1>
                </Link>
                {/* the nav reads the current URL, which on some pages (like /Posts/[id])
                    is only known when someone visits, so it streams in */}
                <Suspense fallback={null}>
                    <Nav />
                </Suspense>
            </div>
        </header>
    )
}
