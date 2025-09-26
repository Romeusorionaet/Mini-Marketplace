import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { providers } from "./providers.schema";

export const services = pgTable("services", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  providerId: integer("provider_id")
    .references(() => providers.id, { onDelete: "cascade" })
    .notNull(),
  typeId: integer("type_id")
    .references(() => serviceTypes.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name"),
  description: text("description"),
  photos: jsonb(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const serviceTypes = pgTable("service_types", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name"),
});

export const serviceVariations = pgTable("service_variations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  serviceId: integer("service_id")
    .references(() => services.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name"),
  priceCents: integer("price_cents"),
  durationMinutes: integer("duration_minutes"),
});
