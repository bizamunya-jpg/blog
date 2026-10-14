"use server"
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_DURATION_MS, encrypt } from "@/lib/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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

function field(body: Record<string, unknown>, name: string) {
    const value = body[name];
    return typeof value === "string"
        ? value.trim()
        : "";
}

export async function createUser(body: Record<string, unknown>): Promise<CreateUserResult> {
    const name = field(body, "name");
    const surname = field(body, "surname");
    const username = field(body, "username");
    const email = field(body, "email").toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirm_Password === "string" ? body.confirm_Password : "";

    if (!name || !surname || !username || !email || !password) {
        return { ok: false, error: "All fields are required", status: 400 };
    }
    if (!EMAIL_PATTERN.test(email)) {
        return { ok: false, error: "Enter a valid email address", status: 400 };
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`, status: 400 };
    }
    if (password !== confirmPassword) {
        return { ok: false, error: "Passwords do not match", status: 400 };
    }

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
