import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastify from "fastify";
import apiRoutes from "./api";
import { registerGlobalErrorHandlers } from "./shared/errors/error-handler";
import { env } from "./shared/utils/env";

export async function buildApp() {
  const app = fastify({
    logger: {
      level: env.nodeEnv === "development" ? "debug" : "info",
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(swagger, {
    openapi: {
      info: {
        title: "News Backend API",
        description:
          "Modular Fastify API for authentication, articles, analytics, and author dashboard",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${env.port}`,
        },
      ],
      tags: [
        {
          name: "Health",
          description: "Health and service monitoring endpoints",
        },
        {
          name: "Auth",
          description: "Authentication endpoints",
        },
        {
          name: "Articles",
          description: "Article lifecycle and public feed endpoints",
        },
        {
          name: "Author",
          description: "Author dashboard endpoints",
        },
        {
          name: "Analytics",
          description: "Analytics processing endpoints",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  registerGlobalErrorHandlers(app);
  await app.register(apiRoutes);

  return app;
}
