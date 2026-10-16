import "server-only"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { SESSION_COOKIE, SESSION_DURATION_MS, encrypt } from "@/lib/session"
import { loginSchema } from "@/lib/schemas"

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

// shared by the login server action; checks the password against the stored hash.
// loginSchema (lib/schemas.ts) checks the email and password are there first
export async function login(body: unknown): Promise<LoginResult> {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0].message, status: 400 };
    }
    const { email, password } = parsed.data;

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
