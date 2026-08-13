import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Scoped to the same origin the WS gateway allows. A bare enableCors() sets
  // Access-Control-Allow-Origin: * , which contradicted the gateway's
  // allowlist and would have been wide open the moment an HTTP route landed.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3001",
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend listening on port ${port}`);
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
