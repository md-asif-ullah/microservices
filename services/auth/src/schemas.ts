import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(20),
  name: z.string().min(2).max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const accessTokenSchema = z.object({
  accessToken: z.string(),
});

export const EmailVerificationSchema = z.object({
  email: z.string().email(),
  verificationCode: z.string(),
});
