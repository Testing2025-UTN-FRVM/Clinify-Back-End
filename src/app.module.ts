import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {entities} from "./entities";
import {UsersController} from "./services/users/users.controller";
import {AuthGuard} from "./middlewares/auth.middleware";
import {JwtService} from "./jwt/jwt.service";
import {UsersService} from "./services/users/users.service";
import { EmpleadoService } from './services/empleado/empleado.service';
import { EmpleadoController } from './services/empleado/empleado.controller';
import { TipoEmpleadoService } from './services/tipo-empleado/tipo-empleado.service';
import { TipoEmpleadoController } from './services/tipo-empleado/tipo-empleado.controller';
import { EspecialidadService } from './services/especialidad/especialidad.service';
import { EspecialidadController } from './services/especialidad/especialidad.controller';
import {IsUniqueEmailConstraint} from "./common/validators/unique-email.validator";
import {IsPersonaDocUniqueConstraint} from "./common/validators/persona-doc-unique.validator";
import { PacienteService } from './services/paciente/paciente.service';
import { PacienteController } from './services/paciente/paciente.controller';
import { GrupoSanguineoService } from './services/grupo-sanguineo/grupo-sanguineo.service';
import { GrupoSanguineoController } from './services/grupo-sanguineo/grupo-sanguineo.controller';
import { PersonaService } from './services/persona/persona.service';
import { TurnoService } from './services/turno/turno.service';
import { TurnoController } from './services/turno/turno.controller';
import { ConsultorioController } from './services/consultorio/consultorio.controller';
import { ConsultorioService } from './services/consultorio/consultorio.service';
import { ProcedimientoService } from './services/procedimiento/procedimiento.service';
import { ProcedimientoController } from './services/procedimiento/procedimiento.controller';
import { EstadoTurnoController } from './services/estado-turno/estado-turno.controller';
import { EstadoTurnoService } from './services/estado-turno/estado-turno.service';



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
    controllers: [AppController, UsersController, EmpleadoController, TipoEmpleadoController, EspecialidadController, PacienteController, GrupoSanguineoController, TurnoController, ConsultorioController, ProcedimientoController, EstadoTurnoController],
    providers: [AuthGuard, JwtService, UsersService, EmpleadoService, TipoEmpleadoService, EspecialidadService,IsUniqueEmailConstraint, IsPersonaDocUniqueConstraint, PacienteService, GrupoSanguineoService, PersonaService, TurnoService, ConsultorioService, ProcedimientoService, EstadoTurnoService]
})
export class AppModule {}
