import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["CLIENT", "PROVIDER"]);

export const statusEnum = pgEnum("status", ["CONFIRMED", "CANCELLED"]);
