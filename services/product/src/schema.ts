import { Status } from "@prisma/client";
import { z } from "zod";

export const ProductCreateSchema = z.object({
  sku: z.string().min(3).max(10),
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(1000).optional(),
  price: z.number().optional().default(0),
  status: z.nativeEnum(Status).optional().default(Status.DRAFT),
});

export const ProductUpdateSchema = z.object({
  sku: z.string().min(3).max(10).optional(),
  name: z.string().min(3).max(255).optional(),
  description: z.string().min(3).max(1000).optional(),
  price: z.number().optional(),
  status: z.nativeEnum(Status).optional(),
});
