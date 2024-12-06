import { ActionType } from "@prisma/client";
import { z } from "zod";

export const InventoryCreateSchema = z.object({
  productId: z.string(),
  sku: z.string(),
  quantity: z.number().int().optional().default(0),
});

export const InventoryUpdateSchema = z.object({
  quantity: z.number().int(),
  actionType: z.nativeEnum(ActionType),
});
