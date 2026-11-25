import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

export const middlewareLogResponses = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.on("finish", () => {
      // Initialize variable
      const statusCode = res.statusCode;
      const method = req.method;
      const url = req.url;

      if (statusCode >= 400) {
        console.log(`
    [NON-OK] ${method} ${url} - Status: ${statusCode}`);
      }
    });
    next();
  } catch (e) {
    console.error("Log Response Failed ", e);
    next(e);
  }
};

export const middlewareMetricsInc = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.on("finish", () => {
      config.api.fileserverHits += 1;
    });

    next();
  } catch (e) {
    console.error("Increamental Failed ", e);
    next(e);
  }
};
