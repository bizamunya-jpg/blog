// Saves the hero slides from src/app/data/data.ts into the database as posts,
// so the hero and the posts list have something to show.
// Run with: npm run seed   (safe to run again: posts that already exist are skipped)
import "dotenv/config";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { heroSlides } from "../app/data/data";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
    // the posts need an owner: the first user who signed up
    const author = await prisma.user.findFirst({ orderBy: { id: "asc" } });
    if (!author) {
        throw new Error("No users yet. Sign up once first, then run the seed again.");
    }

    for (const slide of heroSlides) {
        const exists = await prisma.post.findFirst({ where: { title: slide.title } });
        if (exists) {
            console.log(`skipped (already there): ${slide.title}`);
            continue;
        }

        // the text in data.ts is indented; tidy it, and use its first paragraph as the brief
        const content = slide.brief.split("\n").map((line) => line.trim()).join("\n").trim();
        const brief = content.split(/\n\s*\n/)[0].replace(/\s+/g, " ");
        // saved under the name data.ts's localPictures uses, e.g. "pictures/post-slide-1.jpg"
        const picture = `pictures/${path.basename(slide.bgImg.src)}`;

        await prisma.post.create({
            data: {
                title: slide.title,
                brief,
                content,
                authorId: author.id,
                images: { create: { url: picture, uploaderId: author.id } },
            },
        });
        console.log(`added: ${slide.title}`);
    }
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
