import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { loginController, registerController } from "./auth.controller";
import {
  LoginErrorResponseSchema,
  LoginRequestSchema,
  LoginSuccessResponseSchema,
  RegisterErrorResponseSchema,
  RegisterRequestSchema,
  RegisterSuccessResponseSchema,
} from "./auth.type";

const authRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Register a new account",
        body: RegisterRequestSchema,
        response: {
          201: RegisterSuccessResponseSchema,
          400: RegisterErrorResponseSchema,
          409: RegisterErrorResponseSchema,
          500: RegisterErrorResponseSchema,
        },
      },
    },
    registerController
  );

  app.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Login with email and password",
        body: LoginRequestSchema,
        response: {
          200: LoginSuccessResponseSchema,
          400: LoginErrorResponseSchema,
          401: LoginErrorResponseSchema,
          500: LoginErrorResponseSchema,
        },
      },
    },
    loginController
  );
};

export default authRoutes;
