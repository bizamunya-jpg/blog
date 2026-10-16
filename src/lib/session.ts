import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

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

// id of the user logged in with email + password, or null when there is no valid session.
// Google / GitHub logins go through Auth.js instead and don't set this cookie.
export async function getCurrentUserId(): Promise<number | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;

    try {
        const { userId } = await decrypt(token);
        return typeof userId === "number" ? userId : null;
    } catch {
        // expired or tampered with
        return null;
    }
}
