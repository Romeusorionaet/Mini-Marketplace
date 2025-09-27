import { FastifyInstance } from "fastify";
import { database } from "src/database/db";
import { eq, gt, lt, and } from "drizzle-orm";
import { availabilities } from "src/database/schemas";

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

        return reply
          .status(201)
          .send({ message: "Disponibilidade cadastrada com sucesso." });
      } catch (err: any) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
}
