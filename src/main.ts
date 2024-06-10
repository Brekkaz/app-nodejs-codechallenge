import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //activate validation pipe
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  console.log(`app runnning in port: ${port}`);
  await app.listen(port);
}
bootstrap();
