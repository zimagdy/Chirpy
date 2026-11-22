import { eq, and } from "drizzle-orm";
import { db } from "../connection.js";
import { chirps } from "../schema.js";

export const createChirpy = async (userId: string, body: string) => {
  const [chirpy] = await db
    .insert(chirps)
    .values({
      body,
      userId,
    })
    .returning();

  return chirpy;
};

export const getChirps = async () => {
  const result = await db.select().from(chirps).orderBy(chirps.createdAt);

  return result;
};

export const getChirpy = async (id: string) => {
  const [chirpy] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id))
    .limit(1);

  return chirpy;
};

export const deleteChirpy = async (userId: string, chirpId: string) => {
  const result = await db
    .delete(chirps)
    .where(and(eq(chirps.id, chirpId), eq(chirps.userId, userId)))
    .returning();

  return result.length > 0;
};
