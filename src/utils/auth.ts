import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { error400, error401 } from "../middleware/errorHandler.js";
import type { Request } from "express";
const { randomBytes } = await import("node:crypto");

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export const makeJWT = (
  userId: string,
  expiresIn: number,
  secret: string,
): string => {
  const iat = Math.floor(Date.now() / 1000);

  const payload: Payload = {
    iss: "chirpy",
    sub: userId,
    iat,
    exp: iat + expiresIn,
  };

  return jwt.sign(payload, secret);
};

export const validateJWT = (token: string, secret: string): string => {
  try {
    const payload = jwt.verify(token, secret);

    if (typeof payload === "string") {
      throw new error401("Invalid token payload");
    }

    if (!payload.sub) {
      throw new error401("User id field is not exist");
    }

    return payload.sub;
  } catch (e) {
    console.error("Verify Failed ", e);
    throw new error401("Verify Failed");
  }
};

export const getBearerToken = (req: Request): string => {
  const auth = req.headers.authorization;

  const token = extractBearerToken(auth);

  return token;
};

export const extractBearerToken = (
  authorization: string | undefined,
): string => {
  if (!authorization) {
    throw new error401("Authorization Failed");
  }

  const token = authorization.split(" ")[1];

  return token;
};

export const makeRefreshToken = (): string => {
  const refreshToken = randomBytes(256).toString("hex");
  return refreshToken;
};

export const getAPIKey = (req: Request) => {
  const auth = req.headers.authorization;

  if (!auth) {
    throw new error401("Authorization Failed");
  }

  const apiKey = auth.split(" ")[1];

  return apiKey;
};
