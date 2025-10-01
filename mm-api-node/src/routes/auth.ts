import { eq } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { database } from "../database/db";
import { providers, users } from "../database/schemas";
import { comparePassword, hashPassword } from "../utils/cryptography";

export async function registerRoutes(app: FastifyInstance) {
  app.post<{ Body: SignUpBodyType }>("/sign-up", async (request, reply) => {
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
  });

  app.post<{ Body: SignUpBodyType }>("/sign-in", async (request, reply) => {
    const { email, password } = request.body;

    try {
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return reply.status(401).send({ message: "Email ou senha incorretos" });
      }

      const isPasswordValid = await comparePassword(
        password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        return reply.status(401).send({ message: "Email ou senha incorretos" });
      }

      let providerId: string | null = null;

      if (user.role === "PROVIDER") {
        const [provider] = await database
          .select()
          .from(providers)
          .where(eq(providers.userId, user.id));

        if (provider) {
          providerId = provider.id;
        }
      }

      const token = app.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        providerId,
      });

      reply
        .setCookie("@marketplace", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 1 * 24 * 60 * 60, // 1 dias
        })
        .status(200)
        .send({ message: "Login realizado com sucesso" });
    } catch (err) {
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });

  app.get("/me", async (request, reply) => {
    try {
      const token = request.cookies["@marketplace"];

      if (!token) return reply.status(401).send({ loggedIn: false });

      const payload = request.server.jwt.verify<JwtPayloadType>(token);

      return reply.send({
        loggedIn: true,
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        providerId: payload.providerId,
      });
    } catch (err) {
      return reply.status(401).send({ loggedIn: false });
    }
  });

  app.post("/logout", async (request, reply) => {
    reply
      .clearCookie("@marketplace", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .send({ success: true });
  });
}
