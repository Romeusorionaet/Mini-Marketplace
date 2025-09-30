import { createId } from "@paralleldrive/cuid2";
import {
  availabilities,
  AvailabilitiesSelectModelType,
  providers,
  services,
  serviceTypes,
  serviceVariations,
  users,
} from "./schemas";
import { database } from "./db";
import { hashPassword } from "../utils/cryptography";
import { esClient } from "../services/elastic-search/es-client";

async function seed() {
  const serviceTypesData = [
    "Pintura",
    "Jardinagem",
    "Limpeza Residencial",
    "Limpeza Comercial",
    "Reparo Elétrico",
    "Reparo Hidráulico",
    "Montagem de Móveis",
    "Consultoria TI",
    "Aulas Particulares",
    "Serviço de Fotografia",
  ].map((name) => ({ id: createId(), name }));

  await database
    .insert(serviceTypes)
    .values(serviceTypesData)
    .onConflictDoNothing();

  const passwordHash = await hashPassword("123456");

  const usersData = [
    {
      id: createId(),
      name: "Carlos Silva",
      email: "carlos@example.com",
      passwordHash,
      role: "PROVIDER" as const,
      city: "Canguaretama",
    },
    {
      id: createId(),
      name: "Ana Souza",
      email: "ana@example.com",
      passwordHash,
      role: "PROVIDER" as const,
      city: "Canguaretama",
    },
  ];

  await database.insert(users).values(usersData).onConflictDoNothing();

  const providersData = usersData.map((u) => ({
    id: createId(),
    userId: u.id,
    city: u.city,
  }));

  await database.insert(providers).values(providersData).onConflictDoNothing();

  const serviceNames = [
    [
      "Pintura de parede pequena",
      "Pintura de parede média",
      "Pintura de parede grande",
    ],
    [
      "Manutenção de jardim pequeno",
      "Manutenção de jardim médio",
      "Manutenção de jardim grande",
    ],
  ];

  const exists = await esClient.indices.exists({
    index: "services",
  });

  if (exists) {
    await esClient.indices.delete({ index: "services" });
  }

  for (let i = 0; i < providersData.length; i++) {
    const provider = providersData[i];
    const type = serviceTypesData[i];

    const serviceId = createId();
    const [serviceCreated] = await database
      .insert(services)
      .values({
        id: serviceId,
        providerId: provider.id,
        typeId: type.id,
        name: serviceNames[i][0],
        description: `Serviço de ${serviceNames[i][0]} do ${usersData[i].name}`,
        photos: [
          "https://d6xcmfyh68wv8.cloudfront.net/learn-content/uploads/2022/10/Blog-Image-3.png",
          "https://fjwp.s3.amazonaws.com/blog/wp-content/uploads/2019/02/06165134/life-work-balance-2.png",
        ],
      })
      .returning();

    const variations = serviceNames[i].map((name, idx) => ({
      id: createId(),
      serviceId,
      name,
      priceCents: 10000 + idx * 5000,
      durationMinutes: 60 + idx * 30,
    }));

    await database.insert(serviceVariations).values(variations);

    const variationsFlat = variations.flat();

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
  }

  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];

  for (const provider of providersData) {
    const availData: AvailabilitiesSelectModelType[] = [];

    for (let i = 0; i < 20; i++) {
      const day = daysOfWeek[i % daysOfWeek.length];
      const hour = 8 + (i % 10);
      const start = new Date();
      start.setDate(start.getDate() + day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 60);

      availData.push({
        id: createId(),
        providerId: provider.id,
        dayOfWeek: day,
        startTime: start,
        endTime: end,
      });
    }

    await database.insert(availabilities).values(availData);
  }

  console.log("✅ Seed finalizado!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
