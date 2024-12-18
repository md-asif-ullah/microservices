import { REDIS_HOST, REDIS_PORT } from "@/config";
import ClearCartInRedis from "@/service/clearCartInRedis";
import { Redis } from "ioredis";

const redis = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
});

const CHANNEL_KEY = "__keyevent@0__:expired";

redis.config("SET", "notify-keyspace-events", "Ex");

redis.subscribe(CHANNEL_KEY);

redis.on("message", async (channel: string, message: string) => {
  if (channel === CHANNEL_KEY) {
    console.log("key expired", message);

    const userId = message.split(":")[1];
    await ClearCartInRedis(userId);
  }
});
