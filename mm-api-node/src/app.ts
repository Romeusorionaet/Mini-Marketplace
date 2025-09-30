import fastify from "fastify";
import { fastifyCors } from "@fastify/cors";
import { serviceRoutes } from "./routes/services";
import { scheduleRoutes } from "./routes/schedule";
import { registerRoutes } from "./routes/auth";
import { bookingRoutes } from "./routes/booking";
import { Server } from "socket.io";
import fastifyJwt from "@fastify/jwt";
import { env } from "./env";
import fastifyCookie from "@fastify/cookie";

export const app = fastify();

const setupApp = async () => {
  await app.register(fastifyCors, { origin: env.HOST_URL, credentials: true });
};

app.register(fastifyCookie);

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: "1d" },
  cookie: {
    cookieName: "@marketplace",
    signed: false,
  },
});

export const io = new Server(app.server, {
  cors: {
    origin: env.HOST_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("registerUser", (userId) => {
    socket.join(userId);
  });
});

setupApp();

app.register(registerRoutes, { prefix: "auth" });
app.register(serviceRoutes, { prefix: "service" });
app.register(scheduleRoutes, { prefix: "schedule/availability" });
app.register(bookingRoutes, { prefix: "booking" });
