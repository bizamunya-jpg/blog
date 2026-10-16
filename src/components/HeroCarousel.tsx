"use client"

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import AOS from 'aos'
import 'aos/dist/aos.css'
import type { HeroPost } from '@/lib/hero'
import HeroSlide from '@/components/HeroSlide'

// Swiper is only rendered in the browser: rendering it on the server stops Next.js
// from building the page's static shell (with cacheComponents on)
const HeroSlider = dynamic(() => import('@/components/HeroSlider'), { ssr: false })

export default function HeroCarousel({ slides }: { slides: HeroPost[] }) {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
        });
    }, []);

    return (
        // the first slide sits underneath as a still picture; once the carousel has
        // loaded it covers it exactly, so the page doesn't jump
        <div className="relative overflow-hidden rounded-xl">
            <HeroSlide slide={slides[0]} first />
            <div className="absolute inset-0">
                <HeroSlider slides={slides} />
            </div>
        </div>
    )
}
