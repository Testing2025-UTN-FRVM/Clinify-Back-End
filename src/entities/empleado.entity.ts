import {BaseEntity, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {TipoEmpleadoEntity} from "./tipoEmpleado.entity";
import {UserEntity} from "./user.entity";
import {EspecialidadEntity} from "./especialidad.entity";
import {ConsultorioEntity} from "./consultorio.entity";
import {HistoriaClinicaEntity} from "./historiaClinica.entity";
import {TurnoEntity} from "./turno.entity";
import {PersonaEntity} from "./persona.entity";

@Entity('empleado')
export class EmpleadoEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => TipoEmpleadoEntity, (tipoEmpleado) => tipoEmpleado)
    @JoinColumn({name:'tipo_empleado_id'})
    tipoEmpleado: TipoEmpleadoEntity;

    @OneToOne(()=> PersonaEntity, { nullable: false, eager: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
    @JoinColumn({name: 'persona_id'})
    persona: PersonaEntity;

    @OneToOne(() => UserEntity, { nullable: false, eager: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
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