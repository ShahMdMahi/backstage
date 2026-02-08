import { env } from "@/env";
import { createClient } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

const client = createClient({
  url: env.REDIS_URL!,
});

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// Connect the client
if (!globalForRedis.redis) {
  await client.connect();
}

export const redis = globalForRedis.redis ?? client;

if (env.NODE_ENV !== "production") globalForRedis.redis = redis;
