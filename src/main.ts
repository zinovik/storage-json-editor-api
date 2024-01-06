import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['https://zinovik.github.io'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization', 'Content-Type'],
    });
    await app.listen(8080);
}
bootstrap();
