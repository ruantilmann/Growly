import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalEnvString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().min(1).optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3333"),
  GOOGLE_CLIENT_ID: optionalEnvString,
  GOOGLE_CLIENT_SECRET: optionalEnvString,
  FRONTEND_URL: z
    .string()
    .default(
      "http://localhost:3000,http://localhost:8080,http://localhost,https://localhost,capacitor://localhost,growly://auth,growly://"
    ),
  AI_SERVICE_URL: z.string().url().default("http://localhost:4001"),
  UPLOAD_DIR: z.string().default("uploads")
});

export const env = envSchema.parse(process.env);
