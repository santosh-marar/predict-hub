import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, db, session, user, verification } from "@repo/db";
import { admin } from "better-auth/plugins";
import { createWallet } from "@controllers/wallet";
import { APIError } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8080",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:8080"],
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: ["admin", "super_admin"],
      defaultBanReason: "Spamming",
      impersonationSessionDuration: 60 * 60 * 24 * 7,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // cookieCache: {
    //   enabled: true,
    //   maxAge: 60 * 60 * 24 * 7,
    // },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"],
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {},
        after: async (user, ctx) => {
          try {
            await createWallet(user.id);
          } catch (error) {
            throw new APIError("BAD_REQUEST", {
              message: "Failed to create wallet",
            });
          }
        },
      },
    },
  },
});
