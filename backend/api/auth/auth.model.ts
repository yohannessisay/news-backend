import { eq } from "drizzle-orm";
import { db } from "../../shared/db/client";
import { users } from "../../shared/db/schema";

export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result[0] ?? null;
}

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: "author" | "reader";
};

export async function createUser(input: CreateUserInput) {
  const result = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
    })
    .returning();

  const user = result[0];
  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}

export async function setUserSelfAuditFields(userId: string) {
  const result = await db
    .update(users)
    .set({
      createdBy: userId,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return result[0] ?? null;
}

export async function touchUserAudit(userId: string, actorId: string) {
  const result = await db
    .update(users)
    .set({
      updatedBy: actorId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return result[0] ?? null;
}
