import { Suspense } from 'react'
import { connection } from 'next/server'
import { heroSlides } from '@/app/data/data'
import { getHeroPosts } from '@/lib/hero'
import HeroSlide from '@/components/HeroSlide'
import HeroCarousel from '@/components/HeroCarousel'

// featured posts carousel at the top of the home page:
// the most-liked posts, topped up with the first posts (see lib/hero.ts)
export default function Hero() {
    return (
        <section id="hero-slider" className="w-full py-6" data-aos="fade-in">
            <div className="mx-auto max-w-7xl px-4">
                <Suspense fallback={<StillSlide />}>
                    <HeroPosts />
                </Suspense>
            </div>
        </section>
    )
}

async function HeroPosts() {
    // likes change all the time, so read them on every visit rather than at build time
    await connection()
    const slides = await getHeroPosts()
    return <HeroCarousel slides={slides} />
}

// shown for the moment the posts are being read: the first slide from data.ts, same size
function StillSlide() {
    const slide = heroSlides[0]
    return (
        <div className="overflow-hidden rounded-xl">
            <HeroSlide slide={{ id: `slide-${slide.id}`, title: slide.title, brief: slide.brief, image: slide.bgImg }} first />
        </div>
    )
}
