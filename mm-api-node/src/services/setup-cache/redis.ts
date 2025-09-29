import Redis from "ioredis";
import { env } from "../../env";

const redis = new Redis({
  host: env.REDIS_HOST || "localhost",
  port: Number(env.REDIS_PORT) || 6379,
});

redis.on("connect", () => {
  console.log("✅ Redis conectado");
});

redis.on("error", (err) => {
  console.error("❌ Erro no Redis:", err);
});

export default redis;
