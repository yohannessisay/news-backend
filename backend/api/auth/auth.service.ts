import { AppError } from "../../shared/types/app-error";
import { env } from "../../shared/utils/env";
import { findUserByEmail } from "./auth.model";
import { LoginRequest, LoginResponseData } from "./auth.type";
import { buildAccessToken, isPasswordValid, normalizeEmail } from "./auth.util";

const ACCESS_TOKEN_TTL_SECONDS = env.jwtAccessTokenExpiresInSeconds;

export class AuthService {
  async login(payload: LoginRequest): Promise<LoginResponseData> {
    const email = normalizeEmail(payload.email);
    const user = findUserByEmail(email);

    if (!user || !isPasswordValid(payload.password, user.passwordHash)) {
      throw new AppError({
        statusCode: 401,
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = buildAccessToken({
      sub: sanitizedUser.id,
      email: sanitizedUser.email,
      role: sanitizedUser.role,
      ts: Date.now(),
    });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: sanitizedUser,
    };
  }
}
