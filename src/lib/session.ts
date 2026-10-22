import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { auth } from "@/app/lib/auth";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not set");
const key = new TextEncoder().encode(secretKey);

export const SESSION_COOKIE = "session";
export const SESSION_DURATION_MS = 10 * 60 * 1000;

export type SessionPayload = JWTPayload & { userId: number };

export async function encrypt(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(new Date(Date.now() + SESSION_DURATION_MS))
        .sign(key);
}

export async function decrypt(input: string) {
    const { payload } = await jwtVerify<SessionPayload>(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}

// id of the logged-in user, or null when there is no valid session.
// Email + password logins use our own cookie; Google / GitHub logins go through Auth.js,
// which keeps the database id in its session (see the callbacks in app/lib/auth.ts).
export async function getCurrentUserId(): Promise<number | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
        try {
            const { userId } = await decrypt(token);
            if (typeof userId === "number") return userId;
        } catch {
            // expired or tampered with: fall through to Auth.js
        }
    }

    const session = await auth();
    return session?.dbUserId ?? null;
}
