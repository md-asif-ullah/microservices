import prisma from "@/prisma";
import { CartItemSchema, OrderSchema, productSchema } from "@/schemas";
import axios, { AxiosError } from "axios";
import { Request, Response, NextFunction } from "express";
import { array, z } from "zod";

const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse and validate request body
    const parsedBody = OrderSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    // Fetch cart data
    const { data: cartData } = await axios.get(
      `${process.env.CART_SERVICE_URL}/cart/my-cart`,
      {
        headers: {
          "x-cart-session-id": parsedBody.data.cartSessionId,
        },
      }
    );

    // Validate cart items
    const cartItems = z.array(CartItemSchema).safeParse(cartData.data);

    if (!cartItems.success) {
      return res.status(400).json({ error: cartItems.error.errors });
    }

    // Fetch product details for each cart item
    const productDetails = await Promise.all(
      cartItems.data.map(async (item) => {
        const url = `${process.env.PRODUCT_SERVICE_URL}/products/${item.productId}`;

        try {
          const { data: product } = await axios.get(url);

          return {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            price: product.price,
            quantity: item.quantity,
            total: product.price * item.quantity,
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            return res.status(error.response?.status || 500).json({
              error: error.response?.data.error || error.message,
            });
          }
          throw error;
        }
      })
    );

    const productArray = array(productSchema).safeParse(productDetails);

    if (!productArray.success) {
      return res.status(400).json({ error: productArray.error.errors });
    }

    // Calculate order total
    const subtotal = productArray.data.reduce(
      (arr, curr) => arr + curr.total,
      0
    );

    const tax = Number((subtotal * 0.1).toFixed(2));

    const grandTotal = subtotal + tax;

    // Prepare order object
    const order = await prisma.order.create({
      data: {
        userId: parsedBody.data.userId,
        userName: parsedBody.data.userName,
        userEmail: parsedBody.data.userEmail,
        subtotal,
        tex: tax,
        grandTotal,
        items: {
          create: productArray.data.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          })),
        },
      },
    });

    // Clear cart
    await axios.delete(`${process.env.CART_SERVICE_URL}/cart/clear-cart`, {
      headers: {
        "x-cart-session-id": parsedBody.data.cartSessionId,
      },
    });

    // Send order confirmation email

    await axios.post(`${process.env.EMAIL_SERVICE_URL}/email/send`, {
      recipient: parsedBody.data.userEmail,
      subject: "Order Confirmation",
      body: `Your order has been placed successfully. Order ID: ${order.id}`,
      source: "order confirmation",
    });

    // Respond with success message
    return res.status(200).json({
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Error in checkout service:", error);
    next(error);
  }
};

export default checkout;
