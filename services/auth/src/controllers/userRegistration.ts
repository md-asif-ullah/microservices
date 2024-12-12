import e, { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { userSchema } from "../schemas";
import bcrypt from "bcryptjs";
import axios from "axios";

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseBody = userSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({ error: parseBody.error.errors });
    }

    const existionUser = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (existionUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(req.body.password, salt);

    const newUser = await prisma.user.create({
      data: {
        ...parseBody.data,
        password: hashPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        verified: true,
      },
    });

    if (!newUser) {
      return res.status(400).json({ error: "Failed to create user" });
    }

    await axios.post(`${process.env.USER_SERVICE_URL}/users`, {
      authUserId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    // TODO: genarate verification code
    // TODO: send email to user

    return res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
