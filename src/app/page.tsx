import Image from "next/image"
import Link from "next/link"
import { ImagePlus, MessageCircle, UserPlus } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { WavyBackground } from "@/components/wavy-background"

import postSlide1 from "@/pictures/post-slide-1.jpg"
import postSlide2 from "@/pictures/post-slide-2.jpg"
import postSlide3 from "@/pictures/post-slide-3.jpg"
import postSlide4 from "@/pictures/post-slide-4.jpg"

const features = [
  {
    title: "Write posts",
    text: "Share your thoughts with a title, a short brief and up to 4 pictures.",
    icon: ImagePlus,
  },
  {
    title: "Like and comment",
    text: "Tell writers what you think of their posts and join the conversation.",
    icon: MessageCircle,
  },
  {
    title: "Follow people",
    text: "Follow the writers you like and keep up with what they post.",
    icon: UserPlus,
  },
]

const gallery = [postSlide1, postSlide2, postSlide3, postSlide4]

// the welcome page for visitors who aren't signed in: what Blog Me is, and the way in
export default function Home() {
  return (
    <main className="isolate flex-1 overflow-y-auto p-4 sm:p-6">
      <WavyBackground />

      <div className="mx-auto max-w-5xl space-y-10 rounded-xl bg-white/90 p-6 shadow-lg backdrop-blur sm:p-10">
        <section className="space-y-4 text-center">
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">WELCOME TO BLOG ME</h1>
          <p className="mx-auto max-w-2xl text-stone-600">
            Blog Me is a place to share what&apos;s on your mind. Post your stories and pictures,
            read what others are writing, and connect with the people whose posts you enjoy.
          </p>
          <div className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
            <Link href="/registration" className={buttonVariants({ size: "lg", className: "flex-1" })}>
              Sign up
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "flex-1" })}>
              Log in
            </Link>
          </div>
        </section>

        <section aria-labelledby="features" className="space-y-4">
          <h2 id="features" className="text-center text-xl font-semibold text-stone-900">
            What you can do
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {features.map(({ title, text, icon: Icon }) => (
              <li key={title} className="rounded-lg border border-stone-200 bg-white p-5">
                <Icon className="mb-3 size-6 text-stone-700" aria-hidden="true" />
                <h3 className="font-medium text-stone-900">{title}</h3>
                <p className="mt-1 text-sm text-stone-600">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="gallery" className="space-y-4">
          <h2 id="gallery" className="text-center text-xl font-semibold text-stone-900">
            What people are sharing
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((picture, index) => (
              <div key={picture.src} className="relative aspect-[3/4] overflow-hidden rounded-lg">
                <Image
                  src={picture}
                  alt={`A picture from a Blog Me post (${index + 1} of ${gallery.length})`}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
