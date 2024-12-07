import { Application } from "express";
import { Request, Response } from "express";
import services from "./config.json";
import axios from "axios";

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
      });
      res.status(200).json(data);
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

export const configurRoutes = (app: Application) => {
  Object.entries(services.services).forEach(([_name, service]) => {
    const hostName = service.url;
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(hostName, route.path, method);
        const baseUrl = `/api${route.path}`;

        app[method](baseUrl, handler);
      });
    });
  });
};
