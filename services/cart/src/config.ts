import { config } from "dotenv";

config();

export const REDIS_HOST = process.env.REDIS_HOST || "localhost";
export const REDIS_PORT = process.env.REDIS_PORT || 6379;
export const CART_TTL = process.env.CART_TTL || 10;
