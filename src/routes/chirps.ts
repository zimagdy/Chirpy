import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { checkChirpExists, validateChirpBody } from "../middleware/chirps.js";
import {
  createChirpy,
  deleteChirpy,
  getChirpsAsc,
  getChirpsByAuthorId,
  getChirpsDesc,
} from "../db/queries/chirps.js";
import { error401, error403, error404 } from "../middleware/errorHandler.js";
import { getUserById } from "../db/queries/users.js";

export const chirpsRouter = Router();

/* 
chirpsRouter.get("/api/chirps", async (req, res) => {
  const authorId = req.query.authorId;


  if (!authorId || typeof authorId !== "string") {
    const chirps = await getChirps();
    const bodies = chirps.map((chirp) => chirp.body);

    return res.status(200).json({
      body: bodies,
    });
  }

  // check if exist
  const author = await getUserById(authorId);

  if (!author) {
    throw new error401("User id is not exist");
  }

  const chirps = await getChirpsByAuthorId(authorId);
  const bodies = chirps.map((chirp) => chirp.body);

  res.status(200).json({
    body: bodies,
  });
});
*/

chirpsRouter.get("/api/chirps", async (req, res) => {
  const sortTech = req.query.sort;

  if (sortTech !== undefined && sortTech !== "asc" && sortTech !== "desc") {
    return res.status(400).json({
      error: "Invalid sort parameter",
    });
  }

  if (!sortTech || sortTech === "asc") {
    const chirps = await getChirpsAsc();

    return res.status(200).json(chirps);
  }

  // What if sort is not equal desc
  const chirps = await getChirpsDesc();
  res.status(200).json(chirps);
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
