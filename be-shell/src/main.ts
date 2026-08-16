import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Frontend läuft auf einer eigenen Railway-Domain -> CORS nötig.
  // FRONTEND_URL wird als Service-Variable in Railway gesetzt, mehrere
  // Origins können kommagetrennt angegeben werden.
  const allowedOrigins = process.env.FRONTEND_URL?.split(',').map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins ?? true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
