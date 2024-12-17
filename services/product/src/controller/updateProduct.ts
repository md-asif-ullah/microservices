import prisma from "@/prisma";
import { ProductUpdateSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const parseBody = ProductUpdateSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).send(parseBody.error.errors);
    }
    console.log("parseBody", parseBody);
    // if the product exists

    const productExist = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!productExist) {
      return res.status(404).json({
        message: "product not found",
      });
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: parseBody.data!,
    });

    return res.status(200).json({
      data: product,
    });
  } catch (error) {
    console.log("update-product-error", error);
    return next(error);
  }
};

export default updateProduct;
