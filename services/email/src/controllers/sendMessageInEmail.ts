import { transporter } from "@/config";
import prisma from "@/prisma";
import { EmailCreateSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";

const sendMessageInEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = EmailCreateSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).send(parsedBody.error.errors);
    }

    const { recipient, subject, body, source, sender } = parsedBody.data;

    const form =
      sender || process.env.DEFAULT_SENDER_EMAIL || "admin@example.com";

    const info = await transporter.sendMail({
      from: form,
      to: recipient,
      subject: subject,
      text: body,
    });

    if (!info.messageId) {
      return res.status(400).send("Failed to send email");
    }

    await prisma.email.create({
      data: {
        sender: form,
        recipient,
        subject,
        body,
        source,
      },
    });

    return res.status(200).send("Email sent successfully");
  } catch (error) {
    next(error);
  }
};

export default sendMessageInEmail;
