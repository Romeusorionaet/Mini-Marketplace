import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { createId } from "@paralleldrive/cuid2";

export const providers = pgTable("providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  city: text("city"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
