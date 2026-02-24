import { FastifyReply, FastifyRequest } from "fastify";
import { ApiSuccessResponse } from "../../shared/types/response.type";
import { AuthService } from "./auth.service";
import { LoginRequest, LoginResponseData } from "./auth.type";

const authService = new AuthService();

export async function loginController(
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply
) {
  const data = await authService.login(request.body);

  const response: ApiSuccessResponse<LoginResponseData> = {
    success: true,
    message: "Login successful",
    data,
    error: null,
  };

  return reply.status(200).send(response);
}
