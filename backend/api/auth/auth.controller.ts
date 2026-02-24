import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess } from "../../shared/fastify/response-handler";
import { AuthService } from "./auth.service";
import {
  LoginRequest,
  RegisterRequest,
} from "./auth.type";

const authService = new AuthService();

export async function registerController(
  request: FastifyRequest<{ Body: RegisterRequest }>,
  reply: FastifyReply
) {
  const data = await authService.register(request.body);

  return sendSuccess(reply, 201, "Registration successful", data);
}

export async function loginController(
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply
) {
  const data = await authService.login(request.body);

  return sendSuccess(reply, 200, "Login successful", data);
}
