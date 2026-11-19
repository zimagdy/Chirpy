import type { Request, Response, NextFunction } from "express";
import { error400, error404 } from "./errorHandler.js";
import { getChirpy } from "../db/queries/chirps.js";
import { replaceProfane } from "../utils/replace.js";

// Check chirp exists by ID
export const checkChirpExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const chirpId = req.params.chirpId;

    if (!chirpId || typeof chirpId !== "string") {
      throw new error404("This chirp id does not exist");
    }

    const chirpy = await getChirpy(chirpId);

    if (!chirpy) {
      throw new error404("This chirp id does not exist");
    }

    req.chirp = chirpy;
    req.body = chirpy;
    next();
  } catch (error) {
    next(error);
  }
};

// Validate chirp body and filter profanity
export const validateChirpBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body.body;

    if (body === undefined || body.length === 0) {
      return res.status(400).json({
        error: "Chirp can not empty string",
      });
    }

    if (body.length > 140) {
      throw new error400("Chirp is too long. Max length is 140");
    }

    req.chirpBody = replaceProfane(body);
    next();
  } catch (error) {
    next(error);
  }
};

export const middlewareCheckChirpy = checkChirpExists;
