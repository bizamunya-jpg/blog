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
3. 