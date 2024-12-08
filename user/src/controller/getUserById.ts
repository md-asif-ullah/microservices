import prisma from "@/prisma";
import { User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const field = req.query.field as string;

    let user: User | null = null;
    if (field === "authUserId") {
      user = await prisma.user.findUnique({
        where: {
          authUserId: id,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
    }

    if (!user) {
      res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

export default getUserById;
