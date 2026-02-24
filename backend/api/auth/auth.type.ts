import { Static, Type } from "@sinclair/typebox";
import {
  ApiErrorResponseSchema,
  createSuccessResponseSchema,
} from "../../shared/types/response.type";

export const UserRoleSchema = Type.Union([
  Type.Literal("admin"),
  Type.Literal("user"),
]);

export const LoginRequestSchema = Type.Object(
  {
    email: Type.String({ format: "email", maxLength: 254 }),
    password: Type.String({ minLength: 8, maxLength: 128 }),
  },
  { additionalProperties: false }
);

export const AuthUserSchema = Type.Object(
  {
    id: Type.String(),
    email: Type.String({ format: "email" }),
    name: Type.String(),
    role: UserRoleSchema,
  },
  { additionalProperties: false }
);

export const LoginResponseDataSchema = Type.Object(
  {
    accessToken: Type.String(),
    tokenType: Type.Literal("Bearer"),
    expiresIn: Type.Number(),
    user: AuthUserSchema,
  },
  { additionalProperties: false }
);

export const LoginSuccessResponseSchema =
  createSuccessResponseSchema(LoginResponseDataSchema);

export const LoginErrorResponseSchema = ApiErrorResponseSchema;

export type UserRole = Static<typeof UserRoleSchema>;
export type LoginRequest = Static<typeof LoginRequestSchema>;
export type AuthUser = Static<typeof AuthUserSchema>;
export type LoginResponseData = Static<typeof LoginResponseDataSchema>;
export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  ts: number;
};
export type StoredAuthUser = AuthUser & {
  passwordHash: string;
};
