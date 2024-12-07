import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";
import { InventoryCreateSchema } from "@/schema";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = InventoryCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: { sku: parsedBody.data.sku },
    });

    if (existingInventory) {
      return res.status(409).json({ error: "SKU already exists." });
    }

    const inventory = await prisma.inventory.create({
      data: {
        ...parsedBody.data,
        histories: {
          create: {
            actionType: "IN",
            quantityChange: parsedBody.data.quantity,
            lastQuantity: 0,
            newQuantity: parsedBody.data.quantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    return res.status(201).json(inventory);
  } catch (error: any) {
    next(error);
  }
};

export default createInventory;
