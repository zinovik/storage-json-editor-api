import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['https://zinovik.github.io'],
    });
    await app.listen(8080);
}
bootstrap();

// if (method === 'OPTIONS') {
//     res.set('Access-Control-Allow-Methods', 'GET');
//     res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
//     res.set('Access-Control-Max-Age', '3600');
//     res.status(204).send('');
//     return;
// }
