import { z } from "zod";

export const userSchema = z.object({
  authUserId: z.string(),
  name: z.string(),
  email: z.string().email(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const userUpdateSchema = userSchema.omit({ authUserId: true }).partial();
