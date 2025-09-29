import { eq, inArray } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { CACHE_KEYS } from "../constants/cache-keys";
import { database } from "../database/db";
import { services, serviceTypes, serviceVariations } from "../database/schemas";
import { esClient } from "../services/elastic-search/es-client";
import redis from "../services/setup-cache/redis";

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

        const variationsCreated = await Promise.all(
          service.variations.map((variation) =>
            database
              .insert(serviceVariations)
              .values({
                serviceId: serviceCreated.id,
                name: variation.name,
                priceCents: Number(variation.priceCents),
                durationMinutes: Number(variation.durationMinutes),
              })
              .returning()
          )
        );

        const variationsFlat = variationsCreated.flat();

        await esClient.index({
          index: "services",
          id: serviceCreated.id,
          document: {
            id: serviceCreated.id,
            providerId: serviceCreated.providerId,
            typeId: serviceCreated.typeId,
            name: serviceCreated.name,
            description: serviceCreated.description,
            variations: variationsFlat.map((v) => ({
              id: v.id,
              name: v.name,
              priceCents: v.priceCents,
              durationMinutes: v.durationMinutes,
            })),
          },
        });

        await esClient.indices.refresh({ index: "services" });

        await Promise.all([
          redis.del(CACHE_KEYS.SERVICE_TYPES),
          redis.del(CACHE_KEYS.BY_TYPE(service.typeId)),
          redis.del(CACHE_KEYS.SERVICE(serviceCreated.id)),
        ]);

        return reply
          .status(201)
          .send({ message: "Serviço registrado com sucesso" });
      } catch (err: any) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );

  app.get("/list-types", async (request, reply) => {
    try {
      const CACHE_KEY = CACHE_KEYS.SERVICE_TYPES;
      const cached = await redis.get(CACHE_KEY);
      if (cached) return JSON.parse(cached);

      const services = await database.select().from(serviceTypes);

      await redis.set(CACHE_KEY, JSON.stringify(services), "EX", 300);

      return reply.status(200).send({ services });
    } catch (err: any) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });

  app.get("/by-type", async (request, reply) => {
    const { typeId } = request.query as { typeId: string };

    try {
      const cacheKey = CACHE_KEYS.BY_TYPE(typeId);
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const servicesSameType = await database
        .select()
        .from(services)
        .where(eq(services.typeId, typeId));

      if (servicesSameType.length === 0) {
        return reply.status(200).send([]);
      }

      const serviceIds = servicesSameType.map((s) => s.id);

      const variations = await database
        .select()
        .from(serviceVariations)
        .where(inArray(serviceVariations.serviceId, serviceIds));

      const servicesWithVariations = servicesSameType.map((service) => ({
        ...service,
        variations: variations
          .filter((v) => v.serviceId === service.id)
          .map((v) => ({
            id: v.id,
            name: v.name,
            priceCents: v.priceCents,
            durationMinutes: v.durationMinutes,
          })),
      }));

      await redis.set(
        cacheKey,
        JSON.stringify(servicesWithVariations),
        "EX",
        300
      );

      return reply.status(200).send({ servicesWithVariations });
    } catch (err: any) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });

  app.get("/search", async (request, reply) => {
    const { query } = request.query as { query: string };

    if (!query) {
      return reply
        .status(400)
        .send({ message: "Parâmetro de busca (query) é obrigatório." });
    }

    try {
      const cacheKey = `search:${query}`;
      const cached = await redis.get(cacheKey);

      if (cached)
        return reply.status(200).send({ results: JSON.parse(cached) });

      const { hits } = await esClient.search({
        index: "services",
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query,
                  fields: ["name^2", "description", "variations.name"],
                  fuzziness: "AUTO",
                },
              },
              {
                range: {
                  "variations.priceCents": {
                    lte: parseInt(query),
                  },
                },
              },
              {
                range: {
                  "variations.durationMinutes": {
                    lte: parseInt(query),
                  },
                },
              },
            ],
          },
        },
      });

      const services = hits.hits.map((hit: any) => ({
        id: hit._source.id,
        name: hit._source.name,
        description: hit._source.description,
        providerId: hit._source.providerId,
        typeId: hit._source.typeId,
        variations: hit._source.variations,
        score: hit._score,
      }));

      await redis.set(cacheKey, JSON.stringify(services), "EX", 60);

      return reply.status(200).send({ services });
    } catch (err: any) {
      console.log(err, "===");
      if (err.meta?.body?.error?.type === "index_not_found_exception") {
        return reply.status(200).send({ results: [] });
      }

      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });
}
