import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {EmpleadoEntity} from "./empleado.entity";

@Entity('consultorio')
export class ConsultorioEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    numero: number;

    @Column()
    observaciones: string;

    @OneToMany(()=> EmpleadoEntity, (emp) => emp.consultorio)
    empleados: EmpleadoEntity[];
}