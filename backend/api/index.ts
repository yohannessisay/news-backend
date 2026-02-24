import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import authRoutes from "./auth/auth.route";
import healthRoutes from "./health/health.route";

const apiRoutes: FastifyPluginAsyncTypebox = async (app) => {
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/auth" });
};

const versionedApiRoutes: FastifyPluginAsyncTypebox = async (app) => {
  await app.register(apiRoutes, { prefix: "/api/v1" });
};

export default versionedApiRoutes;
