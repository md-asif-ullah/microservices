import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getEmail = async (req: Request, res: Response, next: NextFunction) => {
  const allEmails = await prisma.email.findMany();
  if (!allEmails) {
    return res.status(404).send("No emails found");
  }
  return res.status(200).send(allEmails);
};

export default getEmail;
