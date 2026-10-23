"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Menu,
    UserRound,
    Home,
    Image,
    ImagePlus,
    LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { logout } from "@/lib/logout"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

const navigation = [
    {
        name: "Home",
        href: "/home",
        icon: Home,
    },
    {
        name: "Posts",
        href: "/Posts",
        icon: Image,
    },
    {
        name: "Create Posts",
        href: "/create_posts",
        icon: ImagePlus,
    },
    {
        name: "User",
        href: "/user",
        icon: UserRound,
    },
]

// the nav is for people who are using the blog, so it is hidden on these pages
// ("/" is the welcome page with the sign up / log in choice)
const AUTH_PAGES = ["/", "/login", "/registration"]

export default function Nav() {
    const pathname = usePathname()

    if (AUTH_PAGES.includes(pathname)) return null

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

    return (
        <nav aria-label="Main">
            {/* wide screens: links in a row */}
            <ul className="hidden items-center gap-1 md:flex">
                {navigation.map(({ name, href, icon: Icon }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            aria-current={isActive(href) ? "page" : undefined}
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                isActive(href)
                                    ? "bg-stone-900 text-white"
                                    : "text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                            }`}
                        >
                            <Icon className="size-4" aria-hidden="true" />
                            {name}
                        </Link>
                    </li>
                ))}
                <li>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logout()}
                        className="text-stone-700 hover:bg-stone-200"
                    >
                        <LogOut aria-hidden="true" />
                        Log out
                    </Button>
                </li>
            </ul>

            {/* small screens: the same links in a dropdown */}
            <div className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
                    >
                        <Menu />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {navigation.map(({ name, href, icon: Icon }) => (
                            <DropdownMenuItem
                                key={href}
                                render={<Link href={href} />}
                                className={isActive(href) ? "font-semibold" : undefined}
                            >
                                <Icon aria-hidden="true" />
                                {name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                            <LogOut aria-hidden="true" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
}
