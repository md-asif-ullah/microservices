import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import { createProduct, getProductDetails, getProducts } from "./controller";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello from product service");
});

// allow only specific origin

app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:8000"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin as string)) {
    res.setHeader("Access-Control-Allow-Origin", origin!);
    next();
  } else {
    res.status(403).send({ message: "Forbidden" });
  }
});

// create routes

app.post("/products", createProduct as any);
app.get("/products", getProducts as any);
app.get("/products/:id", getProductDetails as any);

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
