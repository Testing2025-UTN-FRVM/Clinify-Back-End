import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {EmpleadoEntity} from "./empleado.entity";
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

    @OneToMany(()=> TurnoEntity, (turno) => turno.especialidad)
    turnos: TurnoEntity[];
}