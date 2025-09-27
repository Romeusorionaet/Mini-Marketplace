import { eq } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { database } from "src/database/db";
import { services, serviceVariations } from "src/database/schemas";

export async function serviceRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateServiceBodyType }>(
    "/create",
    async (request, reply) => {
      const service = request.body;

      try {
        const [existTypeService] = await database
          .select()
          .from(services)
          .where(eq(services.typeId, service.typeId));

        if (existTypeService) {
          return reply.status(409).send({
            message: "Você já possui um serviço cadastrado nesta categoria.",
          });
        }

        const [serviceCreated] = await database
          .insert(services)
          .values({
            providerId: service.providerId,
            typeId: service.typeId,
            description: service.description,
            name: service.name,
            photos: service.photos.map((p) => p),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (serviceCreated) {
          await Promise.all(
            service.variations.map((variation) =>
              database.insert(serviceVariations).values({
                serviceId: serviceCreated.id,
                name: variation.name,
                priceCents: Number(variation.priceCents),
                durationMinutes: Number(variation.durationMinutes),
              })
            )
          );
        }

        return reply
          .status(201)
          .send({ message: "Serviço registrado com sucesso" });
      } catch (err: any) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
}
