import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { entities } from './entities';
import { UsersController } from './services/users/users.controller';
import { AuthGuard } from './middlewares/auth.middleware';
import { JwtService } from './jwt/jwt.service';
import { UsersService } from './services/users/users.service';
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
import { ProcedimientoService } from './services/procedimiento/procedimiento.service';
import { EstadoTurnoService } from './services/estado-turno/estado-turno.service';
import { PermissionsService } from 'src/services/permissions/permissions.service';
import { PermissionsController } from 'src/services/permissions/permissions.controller';
import { RolesController } from 'src/services/roles/roles.controller';
import { RolesService } from 'src/services/roles/roles.service';
import { HistoriaClinicaService } from 'src/services/historia-clinica/historia-clinica.service';
import { HistoriaClinicaController } from 'src/services/historia-clinica/historia-clinica.controller';
import { ConsultorioService } from 'src/services/consultorio/consultorio.service';
import { ConsultorioController } from 'src/services/consultorio/consultorio.controller';
import { PersonaController } from './services/persona/persona.controller';
import { EstadoTurnoController } from 'src/services/estado-turno/estado-turno.controller';
import { ProcedimientoController } from 'src/services/procedimiento/procedimiento.controller';
import { IsUniqueEmailConstraint } from 'src/common/validators/unique-email.validator';
import { IsPersonaDocUniqueConstraint } from 'src/common/validators/persona-doc-unique.validator';
import { IsUniqueConsultorioConstraint } from 'src/common/validators/unique-consultorio.validator';



@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                // Soporte tanto para DATABASE_URL (estándar) como variables separadas
                const url =
                    configService.get<string>('DATABASE_URL') ||
                    configService.get<string>('DATABASE_HOST'); // mantener compatibilidad con nombre previo

                const common = {
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true, // Para tests y desarrollo. Desactivar en producción real.
                    logging: false,
                } as const;

                if (url) {
                    return { type: 'postgres', url, ...common };
                }

                return {
                    type: 'postgres',
                    host: configService.get<string>('DB_HOST', 'localhost'),
                        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
                    username: configService.get<string>('DB_USERNAME', 'postgres'),
                    password: configService.get<string>('DB_PASSWORD', 'postgres'),
                    database: configService.get<string>('DB_DATABASE', 'clinify_dev'),
                    ...common,
                };
            },
        }),
        TypeOrmModule.forFeature(entities),
    ],
    controllers: [
        AppController,
        ConsultorioController,
        EmpleadoController,
        EspecialidadController,
        EstadoTurnoController,
        GrupoSanguineoController,
        HistoriaClinicaController,
        PacienteController,
        PermissionsController,
        PersonaController,
        ProcedimientoController,
        RolesController,
        TipoEmpleadoController,
        TurnoController,
        UsersController,
    ],
    providers: [
        AuthGuard,
        JwtService,
        IsUniqueConsultorioConstraint,
        IsUniqueEmailConstraint,
        IsPersonaDocUniqueConstraint,
        ConsultorioService,
        EmpleadoService,
        EspecialidadService,
        EstadoTurnoService,
        GrupoSanguineoService,
        HistoriaClinicaService,
        PacienteService,
        PermissionsService,
        PersonaService,
        ProcedimientoService,
        RolesService,
        TipoEmpleadoService,
        TurnoService,
        UsersService,
    ],
})
export class AppModule {}