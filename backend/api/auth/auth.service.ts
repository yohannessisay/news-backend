import { AppError } from "../../shared/types/app-error";
import {
  createUser,
  findUserByEmail,
  setUserSelfAuditFields,
  touchUserAudit,
} from "./auth.model";
import {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  UserRole,
} from "./auth.type";
import {
  buildAccessToken,
  createPasswordHash,
  isPasswordValid,
  isValidName,
  normalizeEmail,
  normalizeName,
} from "./auth.util";

export class AuthService {
  async register(payload: RegisterRequest): Promise<LoginResponseData> {
    const email = normalizeEmail(payload.email);
    const name = normalizeName(payload.name);
    const role: UserRole = payload.role ?? "reader";

    if (!isValidName(name)) {
      throw new AppError({
        statusCode: 400,
        message: "Name must contain only alphabets and spaces",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new AppError({
        statusCode: 409,
        message: "Email already exists",
      });
    }

    const password = await createPasswordHash(payload.password);

    try {
      const insertedUser = await createUser({
        name,
        email,
        password,
        role,
      });
      const finalizedUser = await setUserSelfAuditFields(insertedUser.id);
      const user = finalizedUser ?? insertedUser;
      const accessToken = buildAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role as UserRole,
        ts: Date.now(),
      });

      return {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          createdBy: user.createdBy,
          updatedBy: user.updatedBy,
        },
      };
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === "23505") {
        throw new AppError({
          statusCode: 409,
          message: "Email already exists",
        });
      }

      throw error;
    }
  }

  async login(payload: LoginRequest): Promise<LoginResponseData> {
    const email = normalizeEmail(payload.email);
    const user = await findUserByEmail(email);

    if (!user) {
      throw new AppError({
        statusCode: 401,
        message: "Invalid email or password",
      });
    }

    const isValid = await isPasswordValid(payload.password, user.password);
    if (!isValid) {
      throw new AppError({
        statusCode: 401,
        message: "Invalid email or password",
      });
    }

    const touchedUser = await touchUserAudit(user.id, user.id);
    const authUser = touchedUser ?? user;
    const accessToken = buildAccessToken({
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role as UserRole,
      ts: Date.now(),
    });

    return {
      accessToken,
      user: {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role as UserRole,
        createdAt: authUser.createdAt.toISOString(),
        updatedAt: authUser.updatedAt.toISOString(),
        createdBy: authUser.createdBy,
        updatedBy: authUser.updatedBy,
      },
    };
  }
}
