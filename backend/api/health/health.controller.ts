import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess } from "../../shared/fastify/response-handler";
import { HealthService } from "./health.service";

const healthService = new HealthService();

export async function healthController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const data = healthService.getStatus();

  return sendSuccess(reply, 200, "Service is healthy", data);
}
