import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {GrupoSanguineoEntity} from "./grupoSanguineo.entity";
import {HistoriaClinicaEntity} from "./historiaClinica.entity";
import {TurnoEntity} from "./turno.entity";
import {PersonaEntity} from "./persona.entity";

@Entity('paciente')
export class PacienteEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    altura: number;

    @Column()
    peso: number;

    @Column()
    observaciones: string;

    @OneToOne(()=> PersonaEntity, { nullable: false, eager: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
    @JoinColumn({name: 'persona_id'})
    persona: PersonaEntity;

    @ManyToOne(()=> GrupoSanguineoEntity, (grupoSanguineo) => grupoSanguineo.pacientes,
        {
            nullable: false, eager: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE'
        })
    @JoinColumn({name: 'grupo_sanguineo'})
    grupoSanguineo: GrupoSanguineoEntity;

    @OneToMany(()=> HistoriaClinicaEntity, (historiaClinica) => historiaClinica.paciente)
    historiasClinicas: HistoriaClinicaEntity[];

    @OneToMany(()=> TurnoEntity, (turno) => turno.paciente)
    turnos: TurnoEntity[];
}