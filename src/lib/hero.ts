import "server-only";
import type { StaticImageData } from "next/image";
import { prisma } from "@/lib/prisma";
import { heroSlides } from "@/app/data/data";
import { resolvePicture } from "@/lib/pictures";

export type HeroPost = {
    id: string;
    title: string;
    brief: string;
    image: StaticImageData | string;
};

const HERO_SIZE = 4;

const heroFields = {
    id: true,
    title: true,
    brief: true,
    content: true,
    images: { take: 1, orderBy: { createdAt: "asc" }, select: { url: true } },
} as const;

// a post without a picture borrows one of the starter slides' pictures
function resolveImage(url: string | undefined, index: number): StaticImageData | string {
    return url ? resolvePicture(url) : heroSlides[index % heroSlides.length].bgImg;
}

// The hero rotates through the most-liked posts. If fewer than four posts have
// any likes, the rest of the slots are filled with the first posts ever written.
// With no posts in the database at all, it falls back to the slides in data.ts.
export async function getHeroPosts(): Promise<HeroPost[]> {
    const mostLiked = await prisma.post.findMany({
        where: { likes: { some: {} } },
        orderBy: [{ likes: { _count: "desc" } }, { createdAt: "asc" }],
        take: HERO_SIZE,
        select: heroFields,
    });

    const firstPosts = mostLiked.length < HERO_SIZE
        ? await prisma.post.findMany({
            where: { id: { notIn: mostLiked.map((post) => post.id) } },
            orderBy: { createdAt: "asc" },
            take: HERO_SIZE - mostLiked.length,
            select: heroFields,
        })
        : [];

    const posts = [...mostLiked, ...firstPosts];

    if (posts.length === 0) {
        return heroSlides.map((slide) => ({
            id: `slide-${slide.id}`,
            title: slide.title,
            brief: slide.brief,
            image: slide.bgImg,
        }));
    }

    return posts.map((post, index) => ({
        id: `post-${post.id}`,
        title: post.title,
        brief: post.brief ?? post.content ?? "",
        image: resolveImage(post.images[0]?.url, index),
    }));
}
