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
import { PacienteService } from './services/paciente/paciente.service';
import { PacienteController } from './services/paciente/paciente.controller';
import { GrupoSanguineoService } from './services/grupo-sanguineo/grupo-sanguineo.service';
import { GrupoSanguineoController } from './services/grupo-sanguineo/grupo-sanguineo.controller';
import { PersonaService } from './services/persona/persona.service';
import { TurnoService } from './services/turno/turno.service';
import { TurnoController } from './services/turno/turno.controller';
import {ProcedimientoService} from "./services/procedimiento/procedimiento.service";
import {EstadoTurnoService} from "./services/estado-turno/estado-turno.service";
import { PermissionsService } from 'src/services/permissions/permissions.service';
import { PermissionsController } from 'src/services/permissions/permissions.controller';
import { RolesController } from 'src/services/roles/roles.controller';
import { RolesService } from 'src/services/roles/roles.service';
import { HistoriaClinicaService } from 'src/services/historia-clinica/historia-clinica.service';
import { HistoriaClinicaController } from 'src/services/historia-clinica/historia-clinica.controller';
import {ConsultorioService} from "src/services/consultorio/consultorio.service";
import {ConsultorioController} from "src/services/consultorio/consultorio.controller";
import { PersonaController } from './services/persona/persona.controller';
import {EstadoTurnoController} from "src/services/estado-turno/estado-turno.controller";
import {ProcedimientoController} from "src/services/procedimiento/procedimiento.controller";
import {IsUniqueEmailConstraint} from "src/common/validators/unique-email.validator";
import {IsPersonaDocUniqueConstraint} from "src/common/validators/persona-doc-unique.validator";



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
            //ssl:true,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
        }),
    }),
    TypeOrmModule.forFeature(entities),
    ],
    controllers: [AppController, ConsultorioController, EmpleadoController, EspecialidadController, EstadoTurnoController, GrupoSanguineoController, HistoriaClinicaController, PacienteController, PermissionsController, PersonaController, ProcedimientoController, RolesController, TipoEmpleadoController, TurnoController, UsersController],
    providers: [AuthGuard, JwtService, IsUniqueEmailConstraint, IsPersonaDocUniqueConstraint, ConsultorioService, EmpleadoService, EspecialidadService, EstadoTurnoService, GrupoSanguineoService, HistoriaClinicaService, PacienteService, PermissionsService, PersonaService, ProcedimientoService, RolesService, TipoEmpleadoService, TurnoService, UsersService]
})
export class AppModule {}
