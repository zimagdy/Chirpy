import { db } from "../connection.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";

export const createUser = async (email: string, password: string) => {
  const [user] = await db
    .insert(users)
    .values({
      email,
      password,
    })
    .onConflictDoNothing()
    .returning();

  return user;
};

export const getUserById = async (id: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
};

export const updateUser = async (
  userId: string,
  newEmail: string,
  newPassword: string,
) => {
  const [result] = await db
    .update(users)
    .set({
      email: newEmail,
      password: newPassword,
    })
    .where(eq(users.id, userId))
    .returning();

  return result;
};

export const deleteUsers = async () => {
  await db.delete(users);
};
