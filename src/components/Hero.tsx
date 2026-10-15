"use client"

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { heroSlides } from '@/app/data/data'
import HeroSlide from '@/components/HeroSlide'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Swiper is only rendered in the browser: rendering it on the server stops Next.js
// from building the page's static shell for /home (with cacheComponents on).
// until it loads, the first slide is shown still, in the same size box, so nothing jumps
const HeroSlider = dynamic(() => import('@/components/HeroSlider'), {
    ssr: false,
    loading: () => (
        <div className="overflow-hidden rounded-xl">
            <HeroSlide slide={heroSlides[0]} first />
        </div>
    ),
})

// featured posts carousel at the top of the home page
export default function Hero() {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
        });
    }, []);

    return (
        <section id="hero-slider" className="w-full py-6" data-aos="fade-in">
            <div className="mx-auto max-w-7xl px-4">
                <HeroSlider />
            </div>
        </section>
    )
}
