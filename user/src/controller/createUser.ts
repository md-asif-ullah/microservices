import { userSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = userSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json(parsedBody.error.errors);
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        authUserId: parsedBody.data.authUserId,
      },
    });

    if (existingUser) {
      res.status(400).send("User already exists");
    }

    const user = await prisma.user.create({
      data: parsedBody.data,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

export default createUser;
