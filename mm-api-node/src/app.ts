import fastify from "fastify";
import { registerRoutes } from "./routes/auth-register";
import { fastifyCors } from "@fastify/cors";

export const app = fastify();

const setupApp = async () => {
  await app.register(fastifyCors, { origin: "*" });
};

setupApp();

app.register(registerRoutes, { prefix: "auth" });
