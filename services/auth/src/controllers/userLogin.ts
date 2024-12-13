import { NextFunction, Request, Response } from "express";
import { loginSchema } from "../schemas";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "@prisma/client";

type LoginHistory = {
  userId: string;
  ipAddress: string | undefined;
  userAgent: string | undefined;
  attempt: LoginAttempt;
};

const createLoginHistory = async (info: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userId: info.userId,
      ipAddress: info.ipAddress || "",
      userAgent: info.userAgent || "",
      attempt: info.attempt,
    },
  });
};

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "";
    const userAgent = req.headers["user-agent"] || "";

    const parseData = loginSchema.safeParse(req.body);
    if (!parseData.success) {
      return res.status(400).json({ error: parseData.error.errors });
    }

    const existionUser = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!existionUser) {
      await createLoginHistory({
        userId: "unknown",
        ipAddress,
        userAgent,
        attempt: "FAILED",
      });
      return res.status(400).json({ error: "invalid credentials" });
    }

    // compare password
    const passwordMatch = bcrypt.compareSync(
      req.body.password,
      existionUser.password
    );

    if (!passwordMatch) {
      await createLoginHistory({
        userId: existionUser.id,
        ipAddress,
        userAgent,
        attempt: "FAILED",
      });
      return res.status(400).json({ error: "invalid credentials" });
    }

    // verify user
    if (!existionUser.verified) {
      await createLoginHistory({
        userId: existionUser.id,
        ipAddress,
        userAgent,
        attempt: "FAILED",
      });
      return res.status(400).json({ error: "User not verified" });
    }

    // check user status

    if (existionUser.status !== "ACTIVE") {
      await createLoginHistory({
        userId: existionUser.id,
        ipAddress,
        userAgent,
        attempt: "FAILED",
      });
      return res.status(400).json({
        error: `your account is ${existionUser.status.toLocaleLowerCase()}`,
      });
    }

    // generate access token

    const accessToken = jwt.sign(
      {
        userId: existionUser.id,
        email: existionUser.email,
        name: existionUser.name,
        role: existionUser.role,
      },
      process.env.JWT_SECRET ?? "secret",
      {
        expiresIn: "1h",
      }
    );

    await createLoginHistory({
      userId: existionUser.id,
      ipAddress,
      userAgent,
      attempt: "SUCCESS",
    });

    return res
      .status(200)
      .json({ message: "login success", data: accessToken });
  } catch (error) {
    next(error);
  }
};

export default userLogin;
