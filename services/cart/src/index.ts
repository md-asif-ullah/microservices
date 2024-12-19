import express, { NextFunction } from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { addToCart, clearCart, getMyCart } from "./controllers";
import "@/controllers/onKeyExpires";
import cors from "cors";

dotenv.config();

const app = express();

// middleware

app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req: Request, res: Response) => {
    res.status(429).send("Too many requests, please try again later.");
  },
});

app.use("/api", limiter);

// test route
app.get("/", (req: Request, res: Response) => {
  res.send("api-gateway is running");
});

// routes

app.post("/cart/add-to-cart", addToCart as any);
app.get("/cart/my-cart", getMyCart as any);
app.delete("/cart/clear-cart", clearCart as any);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send("Sorry can't find that!");
});

// handel error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 8000;
const SERVICE_NAME = process.env.SERVICE_NAME || "api-gateway";
app.listen(PORT, () => {
  console.log(`${SERVICE_NAME}-running http://localhost:${PORT}`);
});
