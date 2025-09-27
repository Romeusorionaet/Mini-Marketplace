import { integer, pgTable, timestamp, text } from "drizzle-orm/pg-core";
import { providers } from "./providers.schema";
import { createId } from "@paralleldrive/cuid2";

export const availabilities = pgTable("availabilities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  providerId: text("provider_id")
    .references(() => providers.id, { onDelete: "cascade" })
    .notNull(),
  dayOfWeek: integer("day_of_week"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
});
