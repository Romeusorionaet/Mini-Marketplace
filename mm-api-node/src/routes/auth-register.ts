import { FastifyInstance } from "fastify";
import { database } from "src/database/db";
import { users } from "src/database/schemas";
import { hashPassword } from "src/utils/cryptography";

export async function registerRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBodyType }>("/register", async (request, reply) => {
    const userData = request.body;

    const hashedPassword = await hashPassword(userData.password);

    try {
      await database.insert(users).values({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
  });
}
