import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { checkChirpExists, validateChirpBody } from "../middleware/chirps.js";
import { createChirpy, deleteChirpy } from "../db/queries/chirps.js";
import { error403, error404 } from "../middleware/errorHandler.js";

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
// Delete chirp
chirpsRouter.delete(
  "/api/chirps/:chirpId",
  authMiddleware,
  checkChirpExists,
  async (req, res) => {
    const chirpId = req.params.chirpId;

    if (!chirpId || typeof chirpId !== "string") {
      throw new error404("This chirp id does not exist");
    }

    const deleted = await deleteChirpy(req.userId!, chirpId);

    if (!deleted) {
      throw new error403("You are not allowed to delete this chirp");
    }

    res.status(204).send();
  },
);
