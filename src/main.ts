import { NestFactory } from '@nestjs/core';
import { ConfigService } from "@nestjs/config";
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    origin: `${configService.get('CLIENT_URL')}:${configService.get('CLIENT_PORT')}`
  })

  const port = configService.get<number>('API_PORT');

  await app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
  });
}

bootstrap();
