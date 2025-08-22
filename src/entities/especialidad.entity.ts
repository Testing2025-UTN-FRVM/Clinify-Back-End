import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {EmpleadoEntity} from "./empleado.entity";

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
}