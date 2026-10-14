import "server-only"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { SESSION_COOKIE, SESSION_DURATION_MS, encrypt } from "@/lib/session"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginResult =
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
    return typeof value === "string" ? value.trim() : ""
}

// shared by the login server action; checks the password against the stored hash
export async function login(body: Record<string, unknown>): Promise<LoginResult> {
    const email = field(body, "email").toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
        return { ok: false, error: "Email and password are required", status: 400 };
    }
    if (!EMAIL_PATTERN.test(email)) {
        return { ok: false, error: "Enter a valid email address", status: 400 };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // same message for an unknown email and a wrong password, so nobody can probe which emails exist
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return { ok: false, error: "Incorrect email or password", status: 401 };
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
