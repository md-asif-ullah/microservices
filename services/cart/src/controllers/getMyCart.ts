import redis from "@/redis";
import { Request, Response, NextFunction } from "express";

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    if (!cartSessionId) {
      await redis.del(`cart:${cartSessionId}`);
      return res.status(400).json({
        data: [],
      });
    }

    const items = await redis.hgetall(`cart:${cartSessionId}`);

    if (Object.keys(items).length === 0) {
      return res.status(400).json({
        data: [],
      });
    }

    const cartItems = Object.keys(items).map((key) => {
      return JSON.parse(items[key]);
    });

    return res.status(200).json({
      data: cartItems,
    });
  } catch (error) {
    console.log("cart-service-error", error);
    return next(error);
  }
};

export default getMyCart;
