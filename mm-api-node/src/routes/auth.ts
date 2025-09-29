import { FastifyInstance } from "fastify";
import { database } from "../database/db";
import { providers, users } from "../database/schemas";
import { hashPassword } from "../utils/cryptography";

export async function registerRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterAuthBodyType }>(
    "/register",
    async (request, reply) => {
      const userData = request.body;

      const hashedPassword = await hashPassword(userData.password);

      try {
        const [userCreated] = await database
          .insert(users)
          .values({
            name: userData.name,
            email: userData.email,
            passwordHash: hashedPassword,
            role: userData.role,
            city: userData.city,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (userData.role === "PROVIDER") {
          await database.insert(providers).values({
            userId: userCreated.id,
            city: userData.city,
          });
        }

        return reply
          .status(201)
          .send({ message: "Usuário registrado com sucesso" });
      } catch (err: any) {
        const pgError = err.cause ?? err;

        if (pgError.code === "23505") {
          return reply.status(400).send({ message: "Email já cadastrado" });
        }

        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
}
