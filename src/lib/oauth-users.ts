import "server-only";
import { prisma } from "@/lib/prisma";

// What Auth.js hands us about someone who just signed in with Google or GitHub.
export type OAuthProfile = {
    provider: string;          // "google" | "github"
    providerAccountId: string; // their id at Google / GitHub
    email: string;
    emailVerified: boolean;    // whether the provider has confirmed they own that email
    name: string;
    surname: string;
    usernameHint: string;      // GitHub login, or the part of the email before the @
};

// Returns the id of the User row for this Google / GitHub account, creating it the first time.
// 1. Signed in with this account before -> the user it's linked to.
// 2. New account, but a user with the same (verified) email exists -> link it to that user,
//    so someone who registered with a password can also use "Sign in with Google".
// 3. Otherwise -> a brand new user with no password.
export async function findOrCreateOAuthUser(profile: OAuthProfile): Promise<number> {
    const { provider, providerAccountId } = profile;
    const email = profile.email.trim().toLowerCase(); // same rule as signup (lib/schemas.ts)

    const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
    });
    if (account) return account.userId;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        // an unverified email could belong to anyone, so it must not unlock someone else's account
        if (!profile.emailVerified) throw new Error("Email is not verified with " + provider);
        await prisma.account.create({ data: { provider, providerAccountId, userId: existing.id } });
        return existing.id;
    }

    const user = await prisma.user.create({
        data: {
            name: profile.name,
            surname: profile.surname,
            username: await freeUsername(profile.usernameHint),
            email,
            accounts: { create: { provider, providerAccountId } },
        },
    });
    return user.id;
}

// usernames are unique, so "ann" becomes "ann_4821" when "ann" is taken
async function freeUsername(hint: string) {
    const base = hint.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24) || "user";
    let candidate = base;
    while (await prisma.user.count({ where: { username: candidate } })) {
        candidate = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return candidate;
}
