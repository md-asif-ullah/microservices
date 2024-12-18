import redis from "@/redis";
import { Request, Response, NextFunction } from "express";

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = req.headers["x-cart-session-id"] as string;

    if (!cartSessionId) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Clear cart in redis
    await redis.del(`cart:${cartSessionId}`);
    await redis.del(`session:${cartSessionId}`);

    // clear the cart session id in the header

    delete req.headers["x-cart-session-id"];

    return res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.log("Error in clearCart", error);
    next(error);
  }
};

export default clearCart;
