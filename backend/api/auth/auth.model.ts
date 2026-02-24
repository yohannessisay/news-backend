import { StoredAuthUser } from "./auth.type";
import { createPasswordHash, normalizeEmail } from "./auth.util";

const users: StoredAuthUser[] = [
  {
    id: "u_1",
    email: normalizeEmail("admin@example.com"),
    name: "Admin User",
    role: "admin",
    passwordHash: createPasswordHash("Password@123"),
  },
];

export function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  return users.find((user) => user.email === normalizedEmail) ?? null;
}
