"use client"

import { heroSlides } from '@/app/data/data'
import HeroSlide from '@/components/HeroSlide'

import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// the Swiper carousel itself; Hero loads it in the browser only (see Hero.tsx)
export default function HeroSlider() {
    return (
        <Swiper
            modules={[A11y, Autoplay, Keyboard, Navigation, Pagination]}
            loop
            speed={600}
            autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            keyboard={{ enabled: true }}
            navigation
            pagination={{ clickable: true }}
            className="overflow-hidden rounded-xl"
            style={{
                // Swiper reads its arrow and dot colours from these variables
                ['--swiper-theme-color' as string]: '#ffffff',
                ['--swiper-navigation-size' as string]: '28px',
                ['--swiper-pagination-bullet-inactive-color' as string]: '#ffffff',
            }}
        >
            {heroSlides.map((slide, index) => (
                <SwiperSlide key={slide.id}>
                    <HeroSlide slide={slide} first={index === 0} />
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
