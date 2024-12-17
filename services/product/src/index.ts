import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import {
  createProduct,
  getProductDetails,
  getProducts,
  updateProduct,
} from "./controller";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ["http://localhost:8000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello from product service");
});

// create routes

app.post("/products", createProduct as any);
app.get("/products", getProducts as any);
app.get("/products/:id", getProductDetails as any);
app.put("/products/:id", updateProduct as any);

// 404 handler
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// handel error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("internal server error");
});

const PORT = process.env.PORT || 3002;
const SERVICE_NAME = process.env.SERVICE_NAME || "product-service";
app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} running http://localhost:${PORT}`);
});
