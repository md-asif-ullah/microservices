import { transporter } from "@/config";
import prisma from "@/prisma";
import { EmailCreateSchema } from "@/schemas";
import { Request, Response, NextFunction, text } from "express";

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = EmailCreateSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).send(parsedBody.error.errors);
    }

    const { recipient, subject, body, source, sender } = parsedBody.data;

    const form =
      sender || process.env.DEFAULT_SENDER_EMAIL || "admin@example.com";
    const emailOptions = {
      form,
      to: recipient,
      subject,
      text: body,
    };

    const { rejected } = await transporter.sendMail(emailOptions);

    if (rejected.length) {
      console.log("Failed to send email", rejected);
      return res.status(500).send("Failed to send email");
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

    res.status(200).send("Email sent successfully");
  } catch (error) {
    res.status(500).send("Failed to send email");
  }
};

export default sendEmail;
