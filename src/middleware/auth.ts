import type { Request, Response, NextFunction } from "express";
import { getBearerToken, validateJWT } from "../utils/auth.js";
import { error401 } from "./errorHandler.js";
import { config } from "../config.js";

// Extract Bearer token
export const tokenExtractor = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(req);
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

// Authenticate JWT
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.key);

    req.token = token;
    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

// Validate email & password
export const validateCredentials = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = req.body.email;
    const userPassword = req.body.password;

    if (email === undefined || email.length === 0) {
      throw new error401("Email can not empty");
    }

    if (userPassword === undefined || userPassword.length === 0) {
      throw new error401("Password can not empty");
    }

    req.email = email;
    req.userPassword = userPassword;
    next();
  } catch (error) {
    next(error);
  }
};

// Dev platform check
export const requireDev = (req: Request, res: Response, next: NextFunction) => {
  if (config.api.platform !== "dev") {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  next();
};
