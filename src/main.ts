import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {useContainer} from "class-validator";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {bufferLogs: true});

    useContainer(app.select(AppModule), { fallbackOnErrors: true }); // <—
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions:
            { enableImplicitConversion: true
            },
    }));

    app.enableCors({
        origin: [
            'http://localhost:4200'
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true
    });

    await app.listen(process.env.PORT ?? 3001);


}
bootstrap();
