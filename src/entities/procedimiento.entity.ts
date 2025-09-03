import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {TurnoEntity} from "./turno.entity";
import {EmpleadoEntity} from "./empleado.entity";

@Entity('procedimiento')
export class ProcedimientoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @Column({default: 30})
    duracion: number;

    @OneToMany(()=> TurnoEntity,(turno) => turno.procedimiento)
    turnos: TurnoEntity[];

    @ManyToMany(()=> EmpleadoEntity, (doctor)=> doctor.procedimientos)
    doctores: EmpleadoEntity[];

}