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

        const [bookingId] = await database
          .insert(bookings)
          .values({
            clientId: payload.sub,
            providerId: booking.providerId,
            serviceVariationId: booking.serviceVariationId,
            availabilityId: booking.availabilityId,
            status: "CONFIRMED",
          })
          .returning({ id: bookings.id });

        const [providerUser] = await database
          .select({
            userId: users.id,
          })
          .from(users)
          .innerJoin(providers, eq(providers.userId, users.id))
          .where(eq(providers.id, booking.providerId));

        if (providerUser) {
          io.to(providerUser.userId).emit("newBooking", {
            bookingId: bookingId.id,
            message: "Você recebeu uma nova contratação!",
          });
        }

        io.to(payload.sub).emit("bookingCreated", {
          bookingId: bookingId.id,
          message: "Sua contratação foi confirmada!",
        });

        await redis.del(CACHE_KEYS.SCHEDULE_PROVIDER(booking.providerId));
        await redis.del(CACHE_KEYS.HISTORY_PROVIDER(booking.providerId));
        await redis.del(CACHE_KEYS.BOOKINGS_CLIENT(payload.sub));

        return reply
          .status(201)
          .send({ message: "Serviço contratado com sucesso!" });
      } catch (err: any) {
        if (err.cause?.code === "23503") {
          return reply
            .status(400)
            .send({ message: "Esse horário foi removido." });
        }

        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );

  app.get("/list/provider", async (request, reply) => {
    const token = request.cookies["@marketplace"];
    if (!token) return reply.status(401).send({ loggedIn: false });
    const payload = request.server.jwt.verify<JwtPayloadType>(token);

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
            eq(bookings.providerId, payload.providerId),
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
      const [booking] = await database
        .update(bookings)
        .set({ status: "CANCELLED" })
        .where(eq(bookings.id, bookingId))
        .returning({ providerId: bookings.providerId });

      await redis.del(CACHE_KEYS.HISTORY_PROVIDER(booking.providerId));

      return reply.status(200).send({ message: "Reserva calelada." });
    } catch (err: any) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });

  app.get("/history/provider", async (request, reply) => {
    const token = request.cookies["@marketplace"];
    if (!token) return reply.status(401).send({ loggedIn: false });
    const payload = request.server.jwt.verify<JwtPayloadType>(token);

    try {
      const cacheKey = CACHE_KEYS.HISTORY_PROVIDER(payload.providerId);
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
        .where(eq(bookings.providerId, payload.providerId));

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
