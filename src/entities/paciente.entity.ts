import {ChildEntity, Column} from "typeorm";
import {PersonaEntity} from "./persona.entity";

@ChildEntity('paciente')
export class PacienteEntity extends PersonaEntity {
    @Column()
    altura: number;

    @Column()
    peso: number;

    @Column()
    observaciones: string;
}