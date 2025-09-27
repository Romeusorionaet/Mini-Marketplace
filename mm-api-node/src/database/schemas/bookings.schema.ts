import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { providers } from "./providers.schema";
import { statusEnum } from "./enums.schema";
import { serviceVariations } from "./services.schema";
import { availabilities } from "./availabilities.schema";
import { createId } from "@paralleldrive/cuid2";

export const bookings = pgTable("bookings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  clientId: text("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  providerId: text("provider_id")
    .references(() => providers.id, { onDelete: "cascade" })
    .notNull(),
  serviceVariationId: text("service_variation_id")
    .references(() => serviceVariations.id, { onDelete: "cascade" })
    .notNull(),
  availabilityId: text("availability_id")
    .references(() => availabilities.id)
    .notNull(),
  status: statusEnum(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
