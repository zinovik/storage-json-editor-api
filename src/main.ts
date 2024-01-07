import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage/storage.module';
import { json } from 'body-parser';

async function bootstrap() {
    const app = await NestFactory.create(StorageModule);
    app.enableCors({
        origin: ['https://zinovik.github.io'],
    });
    app.use(json({ limit: '5mb' }));
    await app.listen(8080);
}
bootstrap();
