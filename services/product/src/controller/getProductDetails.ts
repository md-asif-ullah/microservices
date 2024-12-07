import prisma from "@/prisma";
import axios from "axios";
import { Request, Response, NextFunction } from "express";

const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (product.inventoryId === null) {
      const { data: inventory } = await axios.post(
        `${process.env.INVENTORY_SERVICE_URL}/inventory`,
        {
          productId: product.id,
          sku: product.sku,
        }
      );

      await prisma.product.update({
        where: { id },
        data: { inventoryId: inventory.id },
      });
      return res.status(200).json({
        ...product,
        inventoryId: inventory.id,
        stock: inventory.quantity || 0,
        stockStatus: inventory.quantity > 0 ? "In Stock" : "Out of Stock",
      });
    }
    const { data: inventory } = await axios.get(
      `${process.env.INVENTORY_SERVICE_URL}/inventory/${product.inventoryId}`
    );
    return res.status(200).json({
      ...product,
      stock: inventory.quantity || 0,
      stockStatus: inventory.quantity > 0 ? "In Stock" : "Out of Stock",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export default getProductDetails;
