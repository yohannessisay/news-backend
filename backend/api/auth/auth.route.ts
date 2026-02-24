import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { loginController } from "./auth.controller";
import {
  LoginErrorResponseSchema,
  LoginRequestSchema,
  LoginSuccessResponseSchema,
} from "./auth.type";

const authRoutes: FastifyPluginAsyncTypebox = async (app) => {
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
