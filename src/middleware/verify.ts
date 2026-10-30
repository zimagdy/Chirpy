import type { Request, Response, NextFunction } from "express";
import { Config } from "../config.js";

export const middlewareLogResponses = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.on("finish", () => {
      // Initialize variable
      const statusCode = res.statusCode;
      const statusCodesValid = [200, 201, 202];
      const method = req.method;
      const url = req.url;

      if (!statusCodesValid.includes(statusCode)) {
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
      Config.fileserverHits += 1;
    });

    next();
  } catch (e) {
    console.error("Increamental Failed ", e);
    next(e);
  }
};
