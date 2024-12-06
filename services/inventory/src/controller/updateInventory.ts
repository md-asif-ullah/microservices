import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";
import { InventoryUpdateSchema } from "@/schema";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const findInventory = await prisma.inventory.findUnique({
      where: {
        id,
      },
    });
    if (!findInventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    const parsedBody = InventoryUpdateSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    const lastHistory = await prisma.history.findFirst({
      where: {
        inventoryId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let newQuantity = findInventory.quantity;
    if (parsedBody.data.actionType === "IN") {
      newQuantity += parsedBody.data.quantity;
    } else if (parsedBody.data.actionType === "OUT") {
      newQuantity -= parsedBody.data.quantity;
    } else {
      return res.status(400).json({ error: "Invalid action type" });
    }

    const updateInventory = await prisma.inventory.update({
      where: {
        id,
      },
      data: {
        quantity: newQuantity,
        histories: {
          create: {
            actionType: parsedBody.data.actionType,
            quantityChange: parsedBody.data.quantity,
            lastQuantity: lastHistory?.newQuantity || 0,
            newQuantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    return res.status(200).json(updateInventory);
  } catch (error: any) {
    next(error);
  }
};

export default createInventory;
