import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['https://zinovik.github.io'],
    });
    app.use(json({ limit: '5mb' }));
    app.use(cookieParser());
    await app.listen(8080);
}
bootstrap();
