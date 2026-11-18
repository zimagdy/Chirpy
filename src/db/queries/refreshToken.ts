import { db } from "../connection.js";
import { refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";

export const createRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60);

  const [refreshToken] = await db
    .insert(refreshTokens)
    .values({
      token,
      userId,
      expiresAt,
      revokedAt: null,
    })
    .returning();

  return refreshToken;
};

export const getRefreshToken = async (token: string) => {
  const [refreshToken] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token))
    .limit(1);

  return refreshToken;
};

export const revokeUpdate = async (token: string) => {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, token));
};
