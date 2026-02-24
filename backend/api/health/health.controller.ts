import { FastifyReply, FastifyRequest } from "fastify";
import { ApiSuccessResponse } from "../../shared/types/response.type";
import { HealthService } from "./health.service";
import { HealthResponseData } from "./health.type";

const healthService = new HealthService();

export async function healthController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const data = healthService.getStatus();

  const response: ApiSuccessResponse<HealthResponseData> = {
    success: true,
    message: "Service is healthy",
    data,
    error: null,
  };

  return reply.status(200).send(response);
}
