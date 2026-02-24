import { Static, Type } from "@sinclair/typebox";
import {
  ApiErrorResponseSchema,
  createSuccessResponseSchema,
} from "../../shared/types/response.type";

export const UserRoleSchema = Type.Union([
  Type.Literal("author"),
  Type.Literal("reader"),
]);

export const RegisterRequestSchema = Type.Object(
  {
    name: Type.String({
      minLength: 2,
      maxLength: 120,
      pattern: "^[A-Za-z ]+$",
    }),
    email: Type.String({ format: "email", maxLength: 254 }),
    password: Type.String({ minLength: 8, maxLength: 128 }),
    role: Type.Optional(UserRoleSchema),
  },
  { additionalProperties: false }
);

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
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    createdBy: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
    updatedBy: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
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

export const RegisterSuccessResponseSchema =
  createSuccessResponseSchema(LoginResponseDataSchema);

export const LoginErrorResponseSchema = ApiErrorResponseSchema;
export const RegisterErrorResponseSchema = ApiErrorResponseSchema;

export type UserRole = Static<typeof UserRoleSchema>;
export type RegisterRequest = Static<typeof RegisterRequestSchema>;
export type LoginRequest = Static<typeof LoginRequestSchema>;
export type AuthUser = Static<typeof AuthUserSchema>;
export type LoginResponseData = Static<typeof LoginResponseDataSchema>;
export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  ts: number;
};
