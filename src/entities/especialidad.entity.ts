import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {EmpleadoEntity} from "./empleado.entity";
import {HistoriaClinicaEntity} from "./historiaClinica.entity";
import {TurnoEntity} from "./turno.entity";

@Entity('especialidad')
export class EspecialidadEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @OneToMany(()=> EmpleadoEntity, (emp) => emp.especialidad)
    empleados: EmpleadoEntity[];

    @OneToMany(()=> HistoriaClinicaEntity, (historiaClinica) => historiaClinica.especialidad)
    historiasClinicas: HistoriaClinicaEntity[];

    @OneToMany(()=> TurnoEntity, (turno) => turno.especialidad)
    turnos: TurnoEntity[];
}