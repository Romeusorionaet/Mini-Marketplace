import { FastifyReply, FastifyRequest } from "fastify";

export function verifyJWTAccessToken(requiredRole: "PROVIDER" | "CLIENT") {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = await request.jwtVerify<JwtPayloadType>();

      if (payload.role !== requiredRole) {
        return reply.status(403).send({
          message: "Você não tem permissão para acessar esta rota.",
        });
      }
    } catch (err) {
      return reply.status(401).send({ message: "Não autorizado." });
    }
  };
}
