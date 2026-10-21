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

#### How the posts list does it

1. **Get posts:** `listPosts()` in `src/lib/posts.ts` reads every post, newest first, with its author, its first picture and how many likes and comments it has. The list shows on the home page under the hero and on `/Posts`.
2. **Post image:** each card shows the post's first picture at the top. Posts without a picture just show their text.
3. **Click to view:** the picture and the title both link to the post's own page, `/Posts/<id>`.
4. **Top posts on the home screen:** the hero at the top of the home page shows the most-liked posts (see **Hero** above).
5. **Owner can delete:** the Delete button only appears on posts written by the person who is logged in. The server checks again when it's pressed, so changing the page in the browser can't delete someone else's post. Deleting a post also removes its comments, likes and uploaded pictures.

| File | What it holds |
| --- | --- |
| `src/components/Posts.tsx` | The grid of post cards. |
| `src/components/DeletePostButton.tsx` | The Delete button, with an "are you sure?" question. |
| `src/lib/posts.ts` | Reading, creating and deleting posts, with the owner-only rule. |
| `src/app/(dashboard)/Posts/page.tsx` | The `/Posts` page. |

### Post page

`/Posts/<id>` shows one post in full:

- The cover picture, the title, the author and the date.
- The full text, split into paragraphs wherever there's an empty line.
- Any extra pictures, in a grid under the text.
- A **Like** button and a **Comments** section (below).
- A Delete button, for the author only. After deleting, it goes back to `/Posts`.

A post id that doesn't exist shows the "not found" page.

### Likes

- Anyone logged in can like a post by pressing the heart. Pressing it again takes the like back.
- Each person can like a post only once; the database refuses a second like from the same person.
- The heart turns red and the count changes straight away, and the server saves it in the background.
- Logged-out visitors see the count, with a link to log in.
- Likes decide which posts the hero shows.

### Comments

- Anyone logged in can write a comment under a post. Logged-out visitors see the comments and a link to log in.
- Only the person who wrote a comment sees a Delete button on it, and the server checks this again.
- Comments can't be edited yet, only deleted.

| File | What it holds |
| --- | --- |
| `src/app/(dashboard)/Posts/[id]/page.tsx` | The post page. |
| `src/components/LikeButton.tsx` | The heart button. |
| `src/components/CommentForm.tsx` | The comment box. |
| `src/components/DeleteCommentButton.tsx` | Delete for your own comments. |
| `src/lib/likes.ts`, `src/lib/comments.ts` | The rules for likes and comments. |
| `src/app/actions/posts.ts` | The server actions the buttons and forms call. |

## Create Post Page

`/create_posts` is where logged-in users write a new post. Logged-out visitors are asked to log in.

The page has:

1. **Images:** a drag-and-drop box. Pictures can be dropped on it, or picked by clicking it. Each picture shows a preview with a remove button, and the first one is the post's cover.
2. **Title:** required, up to 200 characters.
3. **Description:** the post itself. Leave an empty line between paragraphs. Its first paragraph becomes the short summary shown on cards and in the hero.

Rules for pictures:

- JPG, PNG, WebP or GIF only.
- Up to 4 pictures, each 4 MB or smaller.
- The page checks this as soon as a picture is added, and the server checks it again when the post is published.

If something is wrong, an error appears and the title, description and pictures stay as they were. When it works, the new post's page opens.

#### Where uploaded pictures go

Uploaded pictures are saved in the `uploads/` folder at the root of the project, each under a random name, and are shown at `/uploads/<name>`. They are kept out of `public/` because a production server only serves the `public/` files that existed when the site was built, so pictures uploaded later would not show.

- `uploads/` is in `.gitignore`, so pictures people upload aren't committed.
- Server actions accept 1 MB by default, so `next.config.ts` raises the limit to 20 MB (`serverActions.bodySizeLimit`) to fit 4 pictures of 4 MB.

| File | What it holds |
| --- | --- |
| `src/app/(dashboard)/create_posts/page.tsx` | The page, and the "log in first" message. |
| `src/components/CreatePostForm.tsx` | The form and the drag-and-drop box. |
| `src/lib/uploads.ts` | Saving and deleting uploaded pictures. |
| `src/app/uploads/[name]/route.ts` | Sends an uploaded picture to the browser. |

## Validation with Zod

Everything people send is checked with [Zod](https://zod.dev) on the server before it reaches the database. The rules live in one file, `src/lib/schemas.ts`, and also give TypeScript the shape of each kind of data (`SignupInput`, `PostFormInput`, and so on).

| Schema | Checks |
| --- | --- |
| `signupSchema` | Name, surname and username are required. The email must be valid and is stored in lower case. The password must be 8–72 characters, and the two passwords must match. |
| `loginSchema` | A valid email and a password. |
| `postFormSchema` | The create-post page: a title and a description. |
| `imageFilesSchema` | Uploaded pictures: type, 4 MB each, at most 4. |
| `postCreateSchema`, `postUpdateSchema` | Posts made by code. An update must change at least one field, and it never resets fields that weren't sent. |
| `commentCreateSchema`, `commentUpdateSchema` | Comment text, up to 2,000 characters. |
| `imageCreateSchema`, `imageUpdateSchema` | Image addresses and their alt text. |
| `idSchema` | Ids sent from forms and addresses: whole numbers above 0. |

Who owns a post, comment or like is never taken from what the browser sends. It always comes from the logged-in session.

## Navigation

The header shows **Blog Me** and the menu: Home, Posts, Create Posts and User, plus **Log out**. On phones the menu folds into a ☰ button. It is hidden on the login and registration pages. Log out ends both kinds of login (email/password and Google/GitHub) and goes to `/login`.

Files: `src/components/Header.tsx`, `src/components/nav.tsx`, `src/lib/logout.ts`.

## User page

`/user` is your own page (log in first); `/user/[id]` is anyone's, opened by clicking an author's name on a post or comment. It shows:

- **Details:** name, surname, username and the date they joined. Your email only shows on your own page.
- **Counts:** posts, followers, following and comments.
- **Their posts** and **their comments** (each comment links to its post). On your own page you can delete them from here.
- **Follow button** on other people's pages. It flips straight away like the like button; you can't follow yourself.

Files: `src/app/(dashboard)/user/`, `src/components/UserProfile.tsx`, `src/components/FollowButton.tsx`, `src/lib/profiles.ts`, `src/lib/follows.ts`, `src/app/actions/users.ts`.

## Database models

| Model | What it stores |
| --- | --- |
| `User` | Name, surname, username, email and the hashed password. |
| `Post` | Title, brief, full text and category, plus its author, pictures, comments and likes. |
| `Image` | A picture's address and alt text, who uploaded it and which post it belongs to. |
| `Comment` | The text, the post and who wrote it. |
| `Like` | Which user liked which post (one per user per post). |
| `Follow` | Which user follows which user (one per pair). |

The schema is in `src/prisma/schema.prisma`. Prisma looks for `.env` in the folder you run it from, so run Prisma commands from the project root and point them at the config with `--config src/prisma.config.ts`:

```bash
# after changing schema.prisma: make and apply a migration, then update the client
npx prisma migrate dev --name <what-changed> --config src/prisma.config.ts
npx prisma generate --config src/prisma.config.ts
```

Restart `npm run dev` after a schema change. The running server keeps the old Prisma client until then.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the site for development. |
| `npm run seed` | Adds the starter posts from `src/app/data/data.ts` to the database. Posts already there are skipped. |
| `npm run lint` | Checks the code for mistakes. |
| `npm run build` | Builds the site for production. |

## Not done yet

- **Google/GitHub users can't post, like or comment.** They aren't saved in the `User` table, so the app doesn't know who they are.
- **Editing posts or comments** hasn't been built.
- **The hero ranks posts by likes.** Homepage point 3 above (posts made that day, by topic) isn't built yet.
