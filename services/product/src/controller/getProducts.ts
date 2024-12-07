import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        inventoryId: true,
      },
    });

    // TODO: Implement pagination
    // TODO: Implement filtering

    return res.status(200).send(products);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export default getProducts;
