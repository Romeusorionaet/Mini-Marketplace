import { eq, and } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { io } from "src/app";
import { database } from "src/database/db";
import { bookings, serviceVariations } from "src/database/schemas";

export async function bookingRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateBookingBodyType }>(
    "/create",
    async (request, reply) => {
      const booking = request.body;

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
          clientId: booking.clientId,
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

        return reply
          .status(201)
          .send({ message: "Serviço contratado com sucesso!" });
      } catch (err: any) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );

  app.get("/list", async (request, reply) => {
    const { providerId } = request.query as { providerId: string };

    try {
      const bookingsProvider = await database
        .select()
        .from(bookings)
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

  app.get("/history", async (request, reply) => {
    const { providerId } = request.query as { providerId: string };

    try {
      const historyBookings = await database
        .select()
        .from(bookings)
        .where(eq(bookings.providerId, providerId));

      return reply.status(200).send({ historyBookings });
    } catch (err: any) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });
}
