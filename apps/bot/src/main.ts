import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT ?? 3006;
  console.log(`Starting server on port ${port}.`);

  await app.listen(port, "0.0.0.0");
}

bootstrap();
