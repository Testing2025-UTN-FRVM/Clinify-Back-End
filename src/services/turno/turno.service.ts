import {ConflictException, Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {TurnoEntity} from "src/entities/turno.entity";
import {DataSource, Repository} from "typeorm";
import {CreateTurnoDTO} from "src/interfaces/create/create-turno.dto";
import {ProcedimientoService} from "../procedimiento/procedimiento.service";
import {EmpleadoService} from "../empleado/empleado.service";
import {PacienteService} from "../paciente/paciente.service";
import {EspecialidadService} from "../especialidad/especialidad.service";
import {EstadoTurnoService} from "../estado-turno/estado-turno.service";

@Injectable()
export class TurnoService {
    constructor(
        @InjectRepository(TurnoEntity)
        private readonly turnoRepository: Repository<TurnoEntity>,

        private readonly procedimientoService: ProcedimientoService,
        private readonly estadoTurnoService: EstadoTurnoService,
        private readonly empleadoService: EmpleadoService,
        private readonly pacienteService: PacienteService,
        private readonly especialidadService: EspecialidadService,

        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async agendarTurno(dto:CreateTurnoDTO): Promise<TurnoEntity> {
        try {
            return await this.dataSource.transaction('SERIALIZABLE',async manager => {
                const inicioFechaTurno = new Date(dto.fechaHoraTurno);

                if(isNaN(inicioFechaTurno.getTime())) {
                    throw new ConflictException('FechaHora invalida')
                }

                await manager.query('SELECT pg_advisory_xact_lock($1, $2)',[dto.doctor, this.dayKayUTC(inicioFechaTurno)]);

                const procedimiento = await this.procedimientoService.findOne(dto.procedimiento);

                const finFechaTurno = new Date(inicioFechaTurno.getTime() + procedimiento.duracion * 60_000)

                const solapa = await manager.query(
                    `
                        SELECT 1
                        FROM "turno" t
                        JOIN "procedimiento" pr ON pr.id = t."procedimiento"
                        WHERE t."doctor" = $1
                        AND tstzrange(
                            t."fechaHoraTurno",
                            t."fechaHoraTurno" + (pr."duracion" || ' minutes')::interval,
                            '[)'
                        ) && tstzrange($2::timestamptz, $3::timestamptz, '[)')
                        LIMIT 1
                    `,
                    [dto.doctor,inicioFechaTurno.toISOString(),finFechaTurno.toISOString()],
                );

                if (solapa.length) {
                    throw new ConflictException('El doctor ya tiene un turno en ese horario')
                }

                const repo = manager.getRepository(TurnoEntity);
                const nuevoTurno = repo.create({
                    fechaRegistro: new Date(),
                    fechaHoraTurno: inicioFechaTurno,
                    motivo: dto.motivo,
                    procedimiento,
                    estado: await this.estadoTurnoService.findOne(1),
                    doctor: await this.empleadoService.findOne(dto.doctor),
                    paciente: await this.pacienteService.findOne(dto.paciente),
                    especialidad: await this.especialidadService.findOne(dto.especialidad)

                })

                return await repo.save(nuevoTurno);

            })
        } catch (error) {
            throw new Error(error.message,error.stack);
        }
    }


    private dayKayUTC(date: Date): number {
        const y = date.getUTCFullYear();
        const m = (date.getUTCMonth()+1).toString().padStart(2, '0');
        const d = date.getUTCDate().toString().padStart(2, '0');
        return Number(`${y}${m}${d}`);
    }

}
