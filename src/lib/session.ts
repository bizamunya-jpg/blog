import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

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
