import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {EmpleadoEntity} from "./empleado.entity";

@Entity('tipo_empleado')
export class TipoEmpleadoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @OneToMany(() => EmpleadoEntity, (emp) => emp.tipoEmpleado)
    empleados: EmpleadoEntity[];
}