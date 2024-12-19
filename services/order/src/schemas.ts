import { string, z } from "zod";

export const OrderSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  cartSessionId: z.string(),
});

export const CartItemSchema = z.object({
  productId: z.string(),
  inventoryId: string(),
  quantity: z.number(),
});

export const productSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  sku: z.string(),
  price: z.number(),
  quantity: z.number(),
  total: z.number(),
});
