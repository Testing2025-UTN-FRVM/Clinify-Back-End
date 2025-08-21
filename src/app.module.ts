import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {entities} from "./entities";
import {UsersController} from "./users/users.controller";
import {AuthGuard} from "./middlewares/auth.middleware";
import {JwtService} from "./jwt/jwt.service";
import {UsersService} from "./users/users.service";
import { EmpleadoService } from './empleado/empleado.service';
import { EmpleadoController } from './empleado/empleado.controller';
import { TipoEmpleadoService } from './tipo-empleado/tipo-empleado.service';
import { TipoEmpleadoController } from './tipo-empleado/tipo-empleado.controller';



@Module({
    imports: [ConfigModule.forRoot({
    isGlobal: true,
    }),

        TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            url: configService.get('DATABASE_HOST'),
            //host: configService.get('DB_HOST'),
            //port: +configService.get('DB_PORT'),
            //username: configService.get('DB_USERNAME'),
            //password: configService.get('DB_PASSWORD'),
            //database: configService.get('DB_DATABASE'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
        }),
    }),
    TypeOrmModule.forFeature(entities),
    ],
    controllers: [AppController, UsersController, EmpleadoController, TipoEmpleadoController],
    providers: [AuthGuard, JwtService, UsersService, EmpleadoService, TipoEmpleadoService],
})
export class AppModule {}
