import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { checkChirpExists, validateChirpBody } from "../middleware/chirps.js";
import { createChirpy } from "../db/queries/chirps.js";

export const chirpsRouter = Router();

// Get chirp by ID
chirpsRouter.get("/api/chirps/:chirpId", checkChirpExists, (req, res) => {
  res.status(200).json({
    ...req.chirp,
  });
});

// Create chirp
chirpsRouter.post(
  "/api/chirps",
  authMiddleware,
  validateChirpBody,
  async (req, res) => {
    const chirpy = await createChirpy(req.userId!, req.chirpBody!);

    return res.status(201).json({
      ...chirpy,
    });
  },
);
