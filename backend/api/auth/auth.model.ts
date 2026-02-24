import { eq } from "drizzle-orm";
import { db } from "../../shared/db/client";
import { users } from "../../shared/db/schema";
import { AuditUser } from "../../shared/types/audit-user.type";

export type UserWithAuditRelations = {
  id: string;
  name: string;
  email: string;
  role: "author" | "reader";
  createdAt: Date;
  updatedAt: Date;
  createdBy: AuditUser | null;
  updatedBy: AuditUser | null;
};

async function findAuditUserById(userId: string | null): Promise<AuditUser | null> {
  if (!userId) {
    return null;
  }

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}

export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result[0] ?? null;
}

export async function findUserWithAuditById(id: string): Promise<UserWithAuditRelations | null> {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      createdById: users.createdBy,
      updatedById: users.updatedBy,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  const row = result[0];
  if (!row) {
    return null;
  }

  const [createdBy, updatedBy] = await Promise.all([
    findAuditUserById(row.createdById),
    findAuditUserById(row.updatedById),
  ]);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy,
    updatedBy,
  };
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

export const authModel = {
  findUserByEmail,
  findUserWithAuditById,
  createUser,
  setUserSelfAuditFields,
  touchUserAudit,
};
