import {ChildEntity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {PersonaEntity} from "./persona.entity";
import {TipoEmpleadoEntity} from "./tipoEmpleado.entity";
import {UserEntity} from "./user.entity";
import {EspecialidadEntity} from "./especialidad.entity";
import {ConsultorioEntity} from "./consultorio.entity";
import {HistoriaClinicaEntity} from "./historiaClinica.entity";
import {TurnoEntity} from "./turno.entity";

@ChildEntity('empleado')
export class EmpleadoEntity extends PersonaEntity {

    @ManyToOne(() => TipoEmpleadoEntity, (tipoEmpleado) => tipoEmpleado)
    @JoinColumn({name:'tipo_empleado_id'})
    tipoEmpleado: TipoEmpleadoEntity;

    @OneToOne(() => UserEntity, { nullable: true, eager: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(()=> EspecialidadEntity, (especialidad) => especialidad.empleados)
    @JoinColumn({name: 'especialidad_id'})
    especialidad: EspecialidadEntity;

    @ManyToOne(()=> ConsultorioEntity, (consultorio) => consultorio.empleados)
    @JoinColumn({name: 'consultorio_id'})
    consultorio: ConsultorioEntity;

    @OneToOne(() => HistoriaClinicaEntity, (historiaClinica) => historiaClinica.doctor)
    historiasClinicas: HistoriaClinicaEntity[];

    @OneToMany(()=> TurnoEntity, (turno) => turno.doctor)
    turnos: TurnoEntity[];
}