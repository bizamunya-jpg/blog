import Image from 'next/image'
import { heroSlides } from '@/app/data/data'

type Slide = (typeof heroSlides)[number]

// one hero slide: photo, dark fade, title and brief.
// used by the carousel and by the still first slide shown while the carousel loads
export default function HeroSlide({ slide, first }: { slide: Slide; first: boolean }) {
    return (
        <div className="relative h-[60vh] min-h-80 max-h-[600px] w-full">
            <Image
                src={slide.bgImg}
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                placeholder="blur"
                loading={first ? 'eager' : 'lazy'}
                fetchPriority={first ? 'high' : 'auto'}
                className="object-cover"
            />

            {/* darkens the bottom of the photo so the white text stays readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 pb-12 sm:p-10 sm:pb-14 md:max-w-3xl">
                <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
                    {slide.title}
                </h2>
                <p className="mt-3 line-clamp-2 text-sm text-white/80 sm:line-clamp-3 sm:text-base">
                    {slide.brief}
                </p>
            </div>
        </div>
    )
}
