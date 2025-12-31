import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Это ГЛОБАЛЬНОЕ исправление для BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*', // Разрешаем фронтенду доступ
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT || 8080);
}
bootstrap();