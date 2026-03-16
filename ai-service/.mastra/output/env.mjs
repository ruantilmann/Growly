import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
const booleanEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value !== "string") {
    return void 0;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return void 0;
}, z.boolean().default(true));
const optionalUrlEnv = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : void 0;
}, z.string().url().optional());
const envSchema = z.object({
  PORT: z.coerce.number().default(4001),
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: optionalUrlEnv,
  OPENROUTER_HTTP_REFERER: optionalUrlEnv,
  OPENROUTER_X_TITLE: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_MAX_TOKENS: z.coerce.number().int().min(128).max(65536).default(1200),
  MASTRA_ENABLED: booleanEnv,
  MASTRA_MODEL: z.string().default("openai/gpt-4o-mini")
});
const env = envSchema.parse(process.env);

export { env as e };
