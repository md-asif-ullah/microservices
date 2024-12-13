import prisma from "@/prisma";
import { EmailVerificationSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";
import axios from "axios";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = EmailVerificationSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({ error: parseBody.error.errors });
    }

    // Check if the user exists

    const existUser = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (!existUser) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if the verification code is correct

    const VerificationCode = await prisma.verification.findFirst({
      where: {
        userId: existUser.id,
        verificationCode: parseBody.data.verificationCode,
      },
    });

    if (!VerificationCode) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (VerificationCode.expiresAt < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    // Update the user's verified status

    await prisma.user.update({
      where: {
        id: existUser.id,
      },
      data: {
        verified: true,
        status: "ACTIVE",
      },
    });

    await prisma.verification.update({
      where: {
        id: VerificationCode.id,
      },
      data: {
        verifiedAt: new Date(),
      },
    });

    // send email to the user

    await axios.post(`${process.env.EMAIL_SERVICE_URL}/email/send`, {
      recipient: existUser.email,
      subject: "Email Verified",
      body: "Your email has been verified",
      source: "verify-email",
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export default verifyEmail;
