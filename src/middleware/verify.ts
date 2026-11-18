import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { error404 } from "./errorHandler.js";
import { getUserById } from "../db/queries/users.js";
import { getChirps, getChirpy } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../utils/auth.js";

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
      config.api.fileserverHits += 1;
    });

    next();
  } catch (e) {
    console.error("Increamental Failed ", e);
    next(e);
  }
};
export const middlewareCheckUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.key);

    const user = await getUserById(userId);

    if (!user) {
      throw new error404("This user does not exist");
    }

    req.body.userId = user.id;

    next();
  } catch (error) {
    next(error);
  }
};

export const middlewareCheckChirpy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const chirpId = req.params.chirpId;

    //@ts-ignore
    const chirpy = await getChirpy(chirpId);

    if (!chirpy) {
      throw new error404("This chirp id does not exist");
    }

    req.body = chirpy;
    next();
  } catch (error) {
    next(error);
  }
};
