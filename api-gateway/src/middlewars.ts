import { Request, Response, NextFunction } from "express";
import axios from "axios";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Malformed Authorization header" });
    }

    let response: any;
    try {
      response = await axios.post(
        `${process.env.AUTH_SERVICE_URL}/auth/verify-token`,
        {
          accessToken: token,
          header: {
            ip: req.ip,
            userAgent: req.headers["user-agent"],
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return res.status(error.response?.status || 500).json({
          error: error.response?.data.error || error.message,
        });
      }
      throw error;
    }

    const { data } = response;

    req.headers["x-user-id"] = data.user.id;
    req.headers["x-user-email"] = data.user.email;
    req.headers["x-user-name"] = data.user.name;
    req.headers["x-user-role"] = data.user.role;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const middlewares = { auth };

export default middlewares;
