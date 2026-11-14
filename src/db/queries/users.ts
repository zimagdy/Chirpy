import { db } from "../connection.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";

export const createUser = async (email: string) => {
  const [user] = await db
    .insert(users)
    .values({
      email,
    })
    .onConflictDoNothing()
    .returning();

  return user;
};

export const getUser = async (id: string) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user;
};

export const deleteUsers = async () => {
  await db.delete(users);
};
