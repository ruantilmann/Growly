import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "../config/env";
import { prisma } from "./prisma";

const trustedOrigins = env.FRONTEND_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const hasGoogleClientId = Boolean(env.GOOGLE_CLIENT_ID);
const hasGoogleClientSecret = Boolean(env.GOOGLE_CLIENT_SECRET);

if (hasGoogleClientId !== hasGoogleClientSecret) {
  throw new Error("Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET juntos para habilitar login Google.");
}

const socialProviders = hasGoogleClientId
  ? {
      google: {
        clientId: env.GOOGLE_CLIENT_ID as string,
        clientSecret: env.GOOGLE_CLIENT_SECRET as string
      }
    }
  : undefined;

export const auth = betterAuth({
  appName: "Growly",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6
  },
  socialProviders,
  user: {
    additionalFields: {
      level: {
        type: ["beginner", "intermediate", "advanced"],
        required: false,
        defaultValue: "beginner"
      }
    }
  }
});
