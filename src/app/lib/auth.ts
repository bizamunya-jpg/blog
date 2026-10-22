import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import type {} from "next-auth/jwt";
import { findOrCreateOAuthUser, type OAuthProfile } from "@/lib/oauth-users";

// the database id of the signed-in user rides along in the Auth.js cookie
declare module "next-auth" {
    interface Session {
        dbUserId?: number;
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        dbUserId?: number;
    }
}

export  const {
    handlers: {GET, POST},
auth,
signIn,
signOut,
} =
NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        // users need an email: it's how a Google / GitHub login is matched to a password account
        signIn({ user }) {
            return Boolean(user.email);
        },
        // runs on every request that reads the session; `account` and `profile` are only
        // there right after signing in, which is when the user is saved to the database
        async jwt({ token, user, account, profile }) {
            if (account && profile && user.email) {
                token.dbUserId = await findOrCreateOAuthUser(
                    toOAuthProfile(account.provider, account.providerAccountId, user.email, profile),
                );
            }
            return token;
        },
        session({ session, token }) {
            session.dbUserId = token.dbUserId;
            return session;
        },
    },
})

// Google and GitHub describe people differently; turn either into what lib/oauth-users.ts needs
function toOAuthProfile(
    provider: string,
    providerAccountId: string,
    email: string,
    profile: Record<string, unknown>,
): OAuthProfile {
    const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
    const emailPrefix = email.split("@")[0];

    if (provider === "google") {
        return {
            provider,
            providerAccountId,
            email,
            emailVerified: profile.email_verified === true,
            name: text(profile.given_name) || text(profile.name) || emailPrefix,
            surname: text(profile.family_name),
            usernameHint: emailPrefix,
        };
    }

    // GitHub has one "name" field (often empty), so split it and fall back to the login
    const [first = "", ...rest] = text(profile.name).split(/\s+/);
    return {
        provider,
        providerAccountId,
        email,
        // Auth.js may fall back to the GitHub account's primary email without checking it was
        // confirmed, so GitHub logins never take over an existing account by email
        emailVerified: false,
        name: first || text(profile.login) || emailPrefix,
        surname: rest.join(" "),
        usernameHint: text(profile.login) || emailPrefix,
    };
}
