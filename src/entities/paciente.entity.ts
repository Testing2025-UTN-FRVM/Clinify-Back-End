import {ChildEntity, Column, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {PersonaEntity} from "./persona.entity";
import {GrupoSanguineoEntity} from "./grupoSanguineo.entity";
import {HistoriaClinicaEntity} from "./historiaClinica.entity";
import {TurnoEntity} from "./turno.entity";

@ChildEntity('paciente')
export class PacienteEntity extends PersonaEntity {
    @Column()
    altura: number;

    @Column()
    peso: number;

    @Column()
    observaciones: string;

    @ManyToOne(()=> GrupoSanguineoEntity, (grupoSanguineo) => grupoSanguineo.pacientes)
    @JoinColumn({name: 'grupo_sanguineo'})
    grupoSanguineo: GrupoSanguineoEntity;

    @OneToMany(()=> HistoriaClinicaEntity, (historiaClinica) => historiaClinica.paciente)
    historiasClinicas: HistoriaClinicaEntity[];

    @OneToMany(()=> TurnoEntity, (turno) => turno.paciente)
    turnos: TurnoEntity[];
}