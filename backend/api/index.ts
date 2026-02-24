import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import analyticsRoutes from "./analytics/analytics.route";
import articleRoutes from "./articles/article.route";
import authorRoutes from "./author/author.route";
import authRoutes from "./auth/auth.route";
import healthRoutes from "./health/health.route";

const apiRoutes: FastifyPluginAsyncTypebox = async (app) => {
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(articleRoutes);
  await app.register(authorRoutes);
  await app.register(analyticsRoutes);
};

const versionedApiRoutes: FastifyPluginAsyncTypebox = async (app) => {
  await app.register(apiRoutes, { prefix: "/api/v1" });
};

export default versionedApiRoutes;
