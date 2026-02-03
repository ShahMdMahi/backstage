import { Cluster } from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Cluster | undefined;
};

const client = new Cluster(
  [
    {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
    },
  ],
  {
    dnsLookup: (address, callback) => callback(null, address),
    redisOptions: {
      tls: {},
    },
  }
);

// Handle connection errors
client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// Connect the client
if (!globalForRedis.redis) {
  await client.connect();
}

export const redis = globalForRedis.redis ?? client;

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
