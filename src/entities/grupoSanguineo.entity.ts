import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {PacienteEntity} from "./paciente.entity";

@Entity('grupo_sanguineo')
export class GrupoSanguineoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @OneToMany(() => PacienteEntity, (paciente) => paciente.grupoSanguineo)
    pacientes: PacienteEntity[];
}