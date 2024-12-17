import { Redis } from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./config";

export const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT as string),
});

export default redis;