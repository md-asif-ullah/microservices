import { CART_TTL } from "@/config";
import redis from "@/redis";
import { CartItem } from "@/schema";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import axios from "axios";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = CartItem.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).send(parseBody.error.errors);
    }

    let cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    if (cartSessionId) {
      const exist = await redis.exists(`session:${cartSessionId}`);

      if (!exist) {
        delete req.headers["x-cart-session-id"];
        return res.status(400).json({ message: "cart is empty" });
      }
    }

    if (!cartSessionId) {
      cartSessionId = uuid();

      // set the cart session id in the redis

      await redis.setex(`session:${cartSessionId}`, CART_TTL, cartSessionId);

      // set the cart session id in the header

      res.setHeader("x-cart-session-id", cartSessionId);
    }

    // check if the inventory is available

    const { data } = await axios.get(
      `${process.env.INVENTORY_SERVICE_URL}/inventory/${parseBody.data.inventoryId}`
    );

    if (Number(data.quantity) < parseBody.data.quantity) {
      return res.status(400).json({
        message: "product not available",
      });
    }

    // update inventory quantity

    await axios.put(
      `${process.env.INVENTORY_SERVICE_URL}/inventory/${parseBody.data.inventoryId}`,
      {
        quantity: parseBody.data.quantity,
        actionType: "OUT",
      }
    );

    await redis.hset(
      `cart:${cartSessionId}`,
      parseBody.data.productId,
      JSON.stringify({
        inventoryId: parseBody.data.inventoryId,
        quantity: parseBody.data.quantity,
      })
    );

    return res.status(200).json({
      message: "product added to cart",
      cartSessionId,
    });
  } catch (error) {
    console.log("cart-service-error", error);
    return next(error);
  }
};

export default addToCart;
