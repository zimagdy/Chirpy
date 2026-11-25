import { Router } from "express";
import {
  authMiddleware,
  tokenExtractor,
  validateCredentials,
} from "../middleware/auth.js";
import { config } from "../config.js";
import {
  createUser,
  getUserByEmail,
  updateUser,
  upgradeChirpyRed,
} from "../db/queries/users.js";
import { checkPasswordHash, hashPassword } from "../utils/password.js";
import { getAPIKey, makeJWT, makeRefreshToken } from "../utils/auth.js";
import {
  createRefreshToken,
  getRefreshToken,
  revokeUpdate,
} from "../db/queries/refreshToken.js";
import { error401, error404 } from "../middleware/errorHandler.js";

export const usersRouter = Router();

// Create user
usersRouter.post("/api/users", validateCredentials, async (req, res) => {
  const hashedPassword = await hashPassword(req.userPassword!);

  const user = await createUser(req.email!, hashedPassword);

  const { password, ...newUser } = user;

  return res.status(201).json({
    message: "User created successfully",
    ...newUser,
  });
});

// Login
usersRouter.post("/api/login", validateCredentials, async (req, res) => {
  let expiresInSeconds = req.body.expiresInSeconds;

  if (
    expiresInSeconds === undefined ||
    expiresInSeconds > 3600 ||
    expiresInSeconds <= 0
  ) {
    expiresInSeconds = 3600;
  }

  const user = await getUserByEmail(req.email!);

  const check = await checkPasswordHash(req.userPassword!, user.password);

  if (!check) {
    return res.status(401).json({
      message: "Incorrect email or password",
    });
  }

  const token = makeJWT(user.id, expiresInSeconds, config.api.key);
  const { password, ...result } = user;

  const refreshToken = makeRefreshToken();

  await createRefreshToken(user.id, refreshToken);

  return res.status(200).json({
    ...result,
    token,
    refreshToken,
  });
});

// Refresh token
usersRouter.post("/api/refresh/", tokenExtractor, async (req, res) => {
  try {
    const refreshToken = await getRefreshToken(req.token!);

    if (
      !refreshToken ||
      refreshToken.expiresAt < new Date() ||
      refreshToken.revokedAt !== null
    ) {
      return res.status(401).json({
        error: "Refresh token is not valid",
      });
    }

    const newToken = makeJWT(refreshToken.userId, 3600, config.api.key);

    return res.status(200).json({
      token: newToken,
    });
  } catch (e) {
    console.error("Refresh Token Failed ", e);
    throw e;
  }
});

// Revoke token
usersRouter.post("/api/revoke/", tokenExtractor, async (req, res) => {
  try {
    await revokeUpdate(req.token!);

    res.status(204).json({
      message: "Everthing is work",
    });
  } catch (e) {
    console.error("Revoked update failed ", e);
    throw e;
  }
});

usersRouter.put(
  "/api/users/",
  validateCredentials,
  authMiddleware,
  async (req, res) => {
    try {
      const hashedPassword = await hashPassword(req.userPassword!);

      const updatedUser = await updateUser(
        req.userId!,
        req.email!,
        hashedPassword,
      );

      const { password, ...result } = updatedUser;

      res.status(200).json({
        message: "Updated successfully",
        ...result,
      });
    } catch (e) {
      console.error("Updated Failed ", e);
      throw e;
    }
  },
);

// Upgrade chirpy red
usersRouter.post("/api/polka/webhooks", async (req, res) => {
  const apiKey = getAPIKey(req);

  if (!apiKey) {
    throw new error401("Permission denied");
  }

  const event = req.body.event;

  if (!event || event !== "user.upgraded") {
    return res.status(204).json({});
  }

  const userId = req.body.data.userId;

  const result = await upgradeChirpyRed(userId);

  if (!result) {
    throw new error404("This user can not be found");
  }

  res.status(204).json({});
});
