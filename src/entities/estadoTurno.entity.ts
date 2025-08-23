import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {TurnoEntity} from "./turno.entity";

@Entity('estado_turno')
export class EstadoTurnoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @OneToMany(()=> TurnoEntity, (turno) => turno.estado)
    turnos: TurnoEntity[];
}