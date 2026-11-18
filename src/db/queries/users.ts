import { db } from "../connection.js";
import { users } from "../schema.js";
import { eq, or } from "drizzle-orm";

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

export const deleteUsers = async () => {
  await db.delete(users);
};
