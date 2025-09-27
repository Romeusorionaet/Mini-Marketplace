import fastify from "fastify";
import { fastifyCors } from "@fastify/cors";
import { serviceRoutes } from "./routes/services";
import { scheduleRoutes } from "./routes/schedule";
import { registerRoutes } from "./routes/auth";
import { bookingRoutes } from "./routes/booking";
import { Server } from "socket.io";

export const app = fastify();

const setupApp = async () => {
  await app.register(fastifyCors, { origin: process.env.HOST_URL });
};

export const io = new Server(app.server, {
  cors: {
    origin: process.env.HOST_URL,
  },
});

setupApp();

app.register(registerRoutes, { prefix: "auth" });
app.register(serviceRoutes, { prefix: "service" });
app.register(scheduleRoutes, { prefix: "schedule/availability" });
app.register(bookingRoutes, { prefix: "booking" });
