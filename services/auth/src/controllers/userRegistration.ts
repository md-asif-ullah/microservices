import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { userSchema } from "../schemas";
import bcrypt from "bcryptjs";
import axios from "axios";

const genarateVerificationCode = () => {
  const timeStamp = new Date().getTime().toString();

  const randomNum = Math.floor(100000 + Math.random() * 900000).toString();

  return (timeStamp + randomNum).slice(-5);
};

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
        email: parseBody.data.email,
      },
    });

    if (existionUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(req.body.password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: parseBody.data.name,
        email: parseBody.data.email,
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

    const verificationCode = genarateVerificationCode();

    await prisma.verification.create({
      data: {
        verificationCode,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
    });

    await axios.post(`${process.env.EMAIL_SERVICE_URL}/email/send`, {
      recipient: newUser.email,
      subject: "Email Verification",
      body: `Your verification code is ${verificationCode}`,
      source: "user-registration",
    });

    return res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
