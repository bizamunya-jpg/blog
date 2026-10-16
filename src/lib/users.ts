"use server"
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_DURATION_MS, encrypt } from "@/lib/session";
import { signupSchema } from "@/lib/schemas";

export type CreateUserResult =
    | {
        ok: true;
        id: number
    }
    | {
        ok: false;
        error: string;
        status: number
    };

// shared by the signup server action and the /apis/auth/users route.
// signupSchema (lib/schemas.ts) checks every field before anything touches the database
export async function createUser(body: unknown): Promise<CreateUserResult> {
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0].message, status: 400 };
    }
    const { name, surname, username, email, password } = parsed.data;

    let user;
    try {
        user = await prisma.user.create({
            data: { name, surname, username, email, password: await bcrypt.hash(password, 10) },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { ok: false, error: "Email or username is already taken", status: 409 };
        }
        throw error;
    }

    const session = await encrypt({ userId: user.id });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(Date.now() + SESSION_DURATION_MS),
    });

    return { ok: true, id: user.id };
}
