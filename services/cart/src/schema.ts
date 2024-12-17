import { z } from "zod";

export const CartItem = z.object({
  productId: z.string(),
  inventoryId: z.string(),
  quantity: z.number(),
});
