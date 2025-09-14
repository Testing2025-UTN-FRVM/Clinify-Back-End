import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {PacienteEntity} from "./paciente.entity";
import {EmpleadoEntity} from "./empleado.entity";

@Entity('historia_clinica')
export class HistoriaClinicaEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fechaEntrada: Date;

    @Column()
    entrada: string;

    @Column()
    observacionExtra: string;

    @ManyToOne(() => PacienteEntity, (paciente) => paciente.historiasClinicas,
        { nullable: false, eager: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
    @JoinColumn({name: 'paciente'})
    paciente: PacienteEntity;

    @ManyToOne(()=> EmpleadoEntity, (doctor)=> doctor.historiasClinicas,
        { nullable: false, eager: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
    @JoinColumn({name: 'doctor'})
    doctor: EmpleadoEntity;
}