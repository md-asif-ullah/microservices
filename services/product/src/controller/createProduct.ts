import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";
import { ProductCreateSchema } from "@/schema";
import axios from "axios";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = ProductCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: parsedBody.data.sku,
      },
    });
    if (existingProduct) {
      return res.status(400).json({ error: "Product already exists" });
    }

    // create product

    const product = await prisma.product.create({
      data: parsedBody.data,
    });

    console.log("product created successfully", parsedBody.data);

    const { data: inventory } = await axios.post(
      `${process.env.INVENTORY_SERVICE_URL}/inventory`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        inventoryId: inventory.id,
      },
    });

    return res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (error: any) {
    next(error);
  }
};

export default createProduct;
