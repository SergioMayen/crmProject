import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function buildValidationMessage(errors: ValidationError[]): string {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children && error.children.length > 0) {
      messages.push(buildValidationMessage(error.children));
    }
  }

  return messages.filter(Boolean).join(', ');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          success: false,
          message: buildValidationMessage(errors) || 'Datos inválidos',
          data: null,
        });
      },
    }),
  );

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  console.log(`CRM backend running on http://localhost:${port}/api`);
}

bootstrap();