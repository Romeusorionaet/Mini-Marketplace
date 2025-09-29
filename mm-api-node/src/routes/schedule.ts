import { FastifyInstance } from "fastify";
import { database } from "../database/db";
import { eq, gt, lt, and, inArray } from "drizzle-orm";
import { availabilities, bookings } from "../database/schemas";
import redis from "../services/setup-cache/redis";
import { CACHE_KEYS } from "../constants/cache-keys";

export async function scheduleRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateScheduleAvailabilityBodyType }>(
    "/create",
    async (request, reply) => {
      const availability = request.body;

      try {
        const startTime = new Date(availability.startTime);
        const endTime = new Date(availability.endTime);

        if (endTime <= startTime) {
          return reply.status(400).send({
            message: "O horário de término deve ser maior que o de início.",
          });
        }

        const [conflicting] = await database
          .select()
          .from(availabilities)
          .where(
            and(
              eq(availabilities.providerId, availability.providerId),
              lt(availabilities.startTime, endTime),
              gt(availabilities.endTime, startTime)
            )
          );

        if (conflicting) {
          return reply.status(400).send({
            message: "Esse horário já está na agenda.",
          });
        }

        await database.insert(availabilities).values({
          providerId: availability.providerId,
          dayOfWeek: startTime.getDay(),
          startTime: new Date(availability.startTime),
          endTime: new Date(availability.endTime),
        });

        await redis.del(CACHE_KEYS.SCHEDULE_PROVIDER(availability.providerId));
        await redis.del(CACHE_KEYS.HISTORY_PROVIDER(availability.providerId));

        return reply
          .status(201)
          .send({ message: "Disponibilidade cadastrada com sucesso." });
      } catch (err: any) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );

  app.get("/list/provider", async (request, reply) => {
    const { providerId } = request.query as { providerId: string };

    try {
      const cacheKey = CACHE_KEYS.SCHEDULE_PROVIDER(providerId);
      const cached = await redis.get(cacheKey);
      if (cached) return reply.send({ availableSchedule: JSON.parse(cached) });

      const schedule = await database
        .select()
        .from(availabilities)
        .where(eq(availabilities.providerId, providerId));

      if (schedule.length === 0) {
        return reply.status(200).send({ schedule: [] });
      }

      const availabilityIds = schedule.map((a) => a.id);

      const booked = await database
        .select()
        .from(bookings)
        .where(inArray(bookings.availabilityId, availabilityIds));

      const availableSchedule = schedule.filter(
        (a) => !booked.some((b) => b.availabilityId === a.id)
      );

      await redis.set(cacheKey, JSON.stringify(availableSchedule), "EX", 300);

      return reply.status(200).send({ availableSchedule });
    } catch (err: any) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });
}
