import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {EmpleadoEntity} from "./empleado.entity";
import {PacienteEntity} from "./paciente.entity";
import {EspecialidadEntity} from "./especialidad.entity";
import {EstadoTurnoEntity} from "./estadoTurno.entity";
import {ProcedimientoEntity} from "./procedimiento.entity";

@Entity('turno')
export class TurnoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'timestamptz', default: () => 'now()'})
    fechaRegistro: Date;

    @Column({type: 'timestamptz'})
    fechaHoraTurno: Date;

    @Column()
    motivo: string;

    @ManyToOne(()=> ProcedimientoEntity,(procedimiento) => procedimiento.turnos)
    @JoinColumn({name: 'procedimiento'})
    procedimiento: ProcedimientoEntity;

    @ManyToOne(()=> EstadoTurnoEntity, (estado) => estado.turnos)
    @JoinColumn({name: 'estado'})
    estado: EstadoTurnoEntity;

    @ManyToOne(()=> EmpleadoEntity, (doctor) => doctor.turnos)
    @JoinColumn({name: 'doctor'})
    doctor: EmpleadoEntity;

    @ManyToOne(()=> PacienteEntity, (paciente) => paciente.turnos)
    @JoinColumn({name: 'paciente'})
    paciente: PacienteEntity;

    @ManyToOne(()=> EspecialidadEntity, (especialidad) => especialidad.turnos)
    @JoinColumn({name: 'especialidad'})
    especialidad: EspecialidadEntity;


}