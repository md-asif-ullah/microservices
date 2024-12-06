import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";

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
      select: {
        quantity: true,
      },
    });

    if (!findInventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    return res.status(200).json(findInventory);
  } catch (error: any) {
    next(error);
  }
};

export default createInventory;
