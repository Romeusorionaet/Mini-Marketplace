import { config } from "dotenv";
import { z } from "zod";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

console.log("⚙️ Current Environment file:", envFile);
config({ path: envFile });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_CLIENT: z.enum(["pg"]),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
  HOST_ELASTICSEARCH: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  HOST_URL: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid environment variable!", _env.error.format());

  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
