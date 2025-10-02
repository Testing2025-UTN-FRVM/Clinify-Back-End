import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {useContainer} from "class-validator";
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    //Logs
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

    //Cors
    app.enableCors({
        origin: [
            'http://localhost:4200'
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true
    });

    //Swagger
    const config = new DocumentBuilder()
        .setTitle('Clinify API')
        .setDescription('Documentación de la API de Clinify')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    app.getHttpAdapter().get('/docs-json', (_, res) => res.json(document));


    await app.listen(process.env.PORT ?? 3001);


}
bootstrap();
