import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { accessTokenSchema } from "../schemas";

async function VerifyAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsebody = accessTokenSchema.safeParse(req.body);

    if (!parsebody.success) {
      return res.status(400).json({ error: parsebody.error.errors });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parsebody.data.accessToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "unauthrized" });
    }

    res.status(200).json({ message: "authorized", user });
  } catch (error) {
    next(error);
  }
}

export default VerifyAccessToken;
