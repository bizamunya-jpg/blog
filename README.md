# Blog App

This blog application is designed to change the way people think, share ideas, and engage with content.

## Getting Started

Install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## User Features

Users should be able to:

1. Register
2. Log in
3. Create, read, update, and delete blog posts
4. Comment on blog posts
5. Create, read, update, and delete comments
6. Upload and manage images

## Application Requirements

1. Registration page
2. Login page
3. Blog list displayed after login or sign-up
4. Blog CRUD functionality
5. Commenting system
6. Comment CRUD functionality
7. Image CRUD functionality

## Tech Stack

1. Zod
2. Prisma + PostgreSQL for database management
3. NextAuth for authentication
4. Next.js for the backend and application framework

## Database Setup with Prisma

### Launch a local Prisma Postgres instance

1. Run:

```bash
npx prisma@7 dev
```

This starts a local Prisma Postgres server that can be connected to using Prisma ORM.

1. Create a `prisma.config.ts` file. See `prisma.config.ts` for configuration.

2. Run the following command to start Prisma in the background:

```bash
npx prisma@7 dev --detach
```

1. Run migrations to create the database and apply schema changes:

```bash
npx prisma@7 migrate dev
```

## Registration Page

The registration page allows new users to create an account before accessing the app.
our key value pairs are.

id|: number  "being our primary key"
Name: string
Surname: string
Username: string
Password: string
confirm_Password: string

the registration page should also use google and github apis or Oauth for authentication so users can signup or login with google account

## Login Page

- The login page is for already existing user though user can use google auth and github auth to login.
- our key value pairs are :

id: number primary key
email: string
password: string

Reason for email not username is to make it easy for when you have used sign in with google or sign up with google when you forget password set by google

## Homepage

- the home page this will have a hero and a posts section

1. it should just have the read command only on viewing or on first entry
2. users should be able to view posts and comment on posts hence they have create, read, update and delete only their comments.
3. should have a transition of post made on that day for the  hero section and some posts made on the day with certain topics


### Hero

The hero is the large sliding banner at the top of the home page. It is the first thing a visitor sees after logging in or signing up.

#### Why the hero

- **To show the best posts first.** A new visitor doesn't know where to start reading. The hero puts a few featured posts right at the top, with a big photo, the title and a short summary, so there is always something worth clicking.
- **It fits the "read only on first entry" rule.** On the first visit the home page is only for reading (see point 1 above). The hero just displays posts; it has no buttons that create, change or delete anything.
- **It gives the blog a look of its own.** Big photos make the home page feel like a real magazine rather than a plain list of links, and help visitors remember the site.
- **It shows several posts in little space.** The slides change by themselves every 5 seconds, so four featured posts share one banner instead of filling the page.

#### What it does

- Shows 4 featured posts, one at a time, each with a photo, a title and a short summary.
- Picks the **most-liked** posts first. If fewer than 4 posts have likes, the remaining slots are filled with the first posts ever written. If the database has no posts at all, it shows the slides in `data.ts`.
- Moves to the next slide every 5 seconds and loops back to the start. It pauses while the mouse is over it so people can finish reading.
- Can be moved by hand with the left/right arrows, the dots underneath, or the keyboard's arrow keys.
- Fades in as the page opens.
- Fills the width on every screen size; on phones the summary is cut to 2 lines so the slide stays readable.

#### What we installed for it

| Package | Why we need it |
| --- | --- |
| `swiper` | Builds the sliding carousel: swiping, arrows, dots, autoplay and looping. |
| `aos` | "Animate On Scroll": gives the hero its fade-in when it appears. |
| `@types/aos` (dev only) | Lets TypeScript understand the `aos` package. |

Install them with:

```bash
npm install swiper aos
npm install -D @types/aos
```

#### Where the pieces are

| File | What it holds |
| --- | --- |
| `src/components/Hero.tsx` | The hero section on the home page. Reads the featured posts on every visit. |
| `src/lib/hero.ts` | Chooses the featured posts: most likes first, then the first posts written. |
| `src/components/HeroCarousel.tsx` | Starts the fade-in and loads the carousel in the browser. |
| `src/components/HeroSlider.tsx` | The Swiper carousel and its settings (speed, autoplay, arrows, dots). |
| `src/components/HeroSlide.tsx` | What one slide looks like: photo, dark fade, title and summary. |
| `src/app/data/data.ts` | `heroSlides`: the starter posts (used by the seed, and as a fallback). `localPictures`: maps a saved picture name like `pictures/post-slide-1.jpg` to the real file. |
| `src/prisma/seed.ts` | Copies `heroSlides` into the database as posts. Run `npm run seed`; posts already there are skipped. |
| `src/pictures/` | The slide photos (`post-slide-1.jpg` to `post-slide-4.jpg`). `data.ts` imports them, so a misspelt file name stops the build instead of showing a broken image. |

What the hero shows now comes from the database, ranked by likes. To add starter posts, add them to `heroSlides` in `data.ts` and run `npm run seed`. To use a new photo from `src/pictures/`, import it at the top of `data.ts` and add it to `localPictures`. A plain text path like `'pictures/post-slide-1.jpg'` won't work, because Next.js only serves files by web address from the `public/` folder.

#### Why the carousel only loads in the browser

The home page is built ahead of time on the server so it opens quickly. Swiper doesn't work in that server step: with it, Next.js couldn't build the page and showed the error *"Route /home did not produce a static shell"*. Its knock-on effects were hydration errors and image warnings.

So `Hero.tsx` loads `HeroSlider` with `dynamic(..., { ssr: false })`, which means only in the browser. Until it has loaded, the first slide is shown as a still picture in the same size box, so the page doesn't jump when the carousel appears.

### Posts 

- The post page should be able to :

1. get posts.
2. get post image.
3. button on post so that users can click post and be able to view post.
4. show the top post in home screen view 
5. if it is the own is present he should be able to delete post