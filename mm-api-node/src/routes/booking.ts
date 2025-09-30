import { eq, and } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { io } from "../app";
import { CACHE_KEYS } from "../constants/cache-keys";
import { database } from "../database/db";
import {
  availabilities,
  bookings,
  providers,
  serviceVariations,
  users,
} from "../database/schemas";
import redis from "../services/setup-cache/redis";
import { verifyJWTAccessToken } from "src/middlewares/verify-jwt-access-token";

export async function bookingRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateBookingBodyType }>(
    "/create",
    { onRequest: verifyJWTAccessToken("CLIENT") },
    async (request, reply) => {
      const booking = request.body;

      const token = request.cookies["@marketplace"];
      if (!token) return reply.status(401).send({ loggedIn: false });
      const payload = request.server.jwt.verify<JwtPayloadType>(token);

      try {
        const [existingBooking] = await database
          .select()
          .from(bookings)
          .where(eq(bookings.availabilityId, booking.availabilityId));

        if (existingBooking) {
          return reply
            .status(400)
            .send({ message: "Esse horário já está reservado." });
        }

        await database.insert(bookings).values({
          clientId: payload.sub,
          providerId: booking.providerId,
          serviceVariationId: booking.serviceVariationId,
          availabilityId: booking.availabilityId,
          status: "CONFIRMED",
        });

        const serviceVariation = await database
          .select()
          .from(serviceVariations)
          .where(eq(serviceVariations.id, booking.serviceVariationId));

        io.to(booking.providerId).emit("newBooking", {
          service: serviceVariation,
          message: "Você recebeu uma nova contratação!",
        });

        await redis.del(CACHE_KEYS.SCHEDULE_PROVIDER(booking.providerId));
        await redis.del(CACHE_KEYS.HISTORY_PROVIDER(booking.providerId));
        await redis.del(CACHE_KEYS.BOOKINGS_CLIENT(booking.clientId));

        return reply
          .status(201)
          .send({ message: "Serviço contratado com sucesso!" });
      } catch (err: any) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );

  app.get("/list/provider", async (request, reply) => {
    const { providerId } = request.query as { providerId: string };

    try {
      const bookingsProvider = await database
        .select()
        .from(bookings)
        .leftJoin(users, eq(users.id, bookings.clientId))
        .leftJoin(
          serviceVariations,
          eq(serviceVariations.id, bookings.serviceVariationId)
        )
        .leftJoin(
          availabilities,
          eq(availabilities.id, bookings.availabilityId)
        )
        .where(
          and(
            eq(bookings.providerId, providerId),
            eq(bookings.status, "CONFIRMED")
          )
        );

      return reply.status(200).send({ bookingsProvider });
    } catch (err: any) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });

  app.patch("/cancel", async (request, reply) => {
    const { bookingId } = request.query as { bookingId: string };

    try {
      await database
        .update(bookings)
        .set({ status: "CANCELLED" })
        .where(eq(bookings.id, bookingId));

      return reply.status(200).send({ message: "Reserva calelada." });
    } catch (err: any) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });

  app.get("/history/provider", async (request, reply) => {
    const { providerId } = request.query as { providerId: string };

    try {
      const cacheKey = CACHE_KEYS.HISTORY_PROVIDER(providerId);
      const cached = await redis.get(cacheKey);
      if (cached) return reply.send({ historyBookings: JSON.parse(cached) });

      const historyBookingsProvider = await database
        .select()
        .from(bookings)
        .leftJoin(users, eq(users.id, bookings.clientId))
        .leftJoin(
          serviceVariations,
          eq(serviceVariations.id, bookings.serviceVariationId)
        )
        .leftJoin(
          availabilities,
          eq(availabilities.id, bookings.availabilityId)
        )
        .where(eq(bookings.providerId, providerId));

      await redis.set(
        cacheKey,
        JSON.stringify(historyBookingsProvider),
        "EX",
        300
      );

      return reply.status(200).send({ historyBookingsProvider });
    } catch (err: any) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });

  app.get(
    "/list/client",
    { onRequest: verifyJWTAccessToken("CLIENT") },
    async (request, reply) => {
      const token = request.cookies["@marketplace"];
      if (!token) return reply.status(401).send({ loggedIn: false });
      const payload = request.server.jwt.verify<JwtPayloadType>(token);

      try {
        const cacheKey = CACHE_KEYS.BOOKINGS_CLIENT(payload.sub);
        const cached = await redis.get(cacheKey);
        if (cached) return reply.send({ clientBookings: JSON.parse(cached) });

        const clientBookings = await database
          .select({
            id: bookings.id,
            status: bookings.status,
            createdAt: bookings.createdAt,
            updatedAt: bookings.updatedAt,
            providerEmail: users.email,
            serviceVariation: serviceVariations,
            availability: availabilities,
          })
          .from(bookings)
          .leftJoin(providers, eq(providers.id, bookings.providerId))
          .leftJoin(users, eq(users.id, providers.userId))
          .leftJoin(
            serviceVariations,
            eq(serviceVariations.id, bookings.serviceVariationId)
          )
          .leftJoin(
            availabilities,
            eq(availabilities.id, bookings.availabilityId)
          )
          .where(eq(bookings.clientId, payload.sub));

        await redis.set(cacheKey, JSON.stringify(clientBookings), "EX", 300);

        return reply.status(200).send({ clientBookings });
      } catch (err: any) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
}
