import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { accessTokenSchema } from "../schemas";
import jwt, { JwtPayload } from "jsonwebtoken";

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

    const accessToken = parsebody.data.accessToken;

    if (!accessToken || accessToken.split(".").length !== 3) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // verify token

    let decoded: JwtPayload | string;

    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET || "secret");
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (typeof decoded !== "object" || !decoded) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
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
