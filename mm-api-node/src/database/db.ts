import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./../env";

export const database = drizzle(env.DATABASE_URL!);
