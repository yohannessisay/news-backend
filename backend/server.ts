import { buildApp } from "./app";
import { env } from "./shared/utils/env";

async function startServer() {
  const app = await buildApp();

  try {
    await app.listen({ host: "0.0.0.0", port: env.port });
    app.log.info(`Server running on http://localhost:${env.port}`);
    app.log.info(`Swagger docs available at http://localhost:${env.port}/docs`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void startServer();
