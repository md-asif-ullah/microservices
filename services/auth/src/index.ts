import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { userLogin, userRegistration } from "./controllers";
import VerifyAccessToken from "./controllers/verifyAccessToken";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from inventory service");
});

// create routes
app.post("/auth/register", userRegistration as any);
app.post("/auth/login", userLogin as any);
app.post("/auth/verify", VerifyAccessToken as any);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send("Sorry can't find that!");
});

// handel error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
const SERVICE_NAME = process.env.SERVICE_NAME || "auth";
app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} running http://localhost:${PORT}`);
});
