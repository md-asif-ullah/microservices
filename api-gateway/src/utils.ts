import { Application } from "express";
import { Request, Response } from "express";
import services from "./config.json";
import axios from "axios";
import middlewares from "./middlewars";

export const createHandler = (
  hostName: string,
  path: string,
  method: string
) => {
  return async (req: Request, res: Response) => {
    let url = `${hostName}${path}`;
    req.params &&
      Object.keys(req.params).forEach((key) => {
        url = url.replace(`:${key}`, req.params[key]);
      });
    try {
      const { data } = await axios({
        method,
        url: url,
        data: req.body,
        headers: {
          origin: "http://localhost:8000",
          "x-user-id": req.headers["x-user-id"] || "",
          "x-user-email": req.headers["x-user-email"] || "",
          "x-user-name": req.headers["x-user-name"] || "",
          "x-user-role": req.headers["x-user-role"] || "",
          "User-Agent": req.headers["User-Agent"] || "",
        },
      });
      return res.status(200).json(data);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        res.status(error.response?.status || 500).json(error.response?.data);
      } else {
        console.log("error in api-gateway/src/utils.ts", error);
        res.status(500).json({ message: "internal server error" });
      }
    }
  };
};

export const getMiddlewares = (names: string[]) => {
  return names.map((name) => middlewares[name]);
};

export const configurRoutes = (app: Application) => {
  Object.entries(services.services).forEach(([_name, service]) => {
    const hostName = service.url;
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(hostName, route.path, method);
        const middlewares = getMiddlewares(route.middlewares);
        const baseUrl = `/api${route.path}`;

        app[method](baseUrl, middlewares, handler);
      });
    });
  });
};
