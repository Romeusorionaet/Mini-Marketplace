import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { providers } from "./providers.schema";

export const availabilities = pgTable("availabilities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  providerId: integer("provider_id")
    .references(() => providers.id, { onDelete: "cascade" })
    .notNull(),
  dayOfWeek: integer("day_of_week"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
});
