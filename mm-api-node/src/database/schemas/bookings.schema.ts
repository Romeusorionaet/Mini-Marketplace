import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { providers } from "./providers.schema";
import { statusEnum } from "./enums.schema";
import { serviceVariations } from "./services.schema";

export const bookings = pgTable("bookings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  providerId: integer("provider_id")
    .references(() => providers.id, { onDelete: "cascade" })
    .notNull(),
  serviceVariationId: integer("service_variation_id")
    .references(() => serviceVariations.id, { onDelete: "cascade" })
    .notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  status: statusEnum(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
