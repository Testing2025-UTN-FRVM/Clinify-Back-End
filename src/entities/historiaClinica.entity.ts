import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {PacienteEntity} from "./paciente.entity";
import {EmpleadoEntity} from "./empleado.entity";
import {EspecialidadEntity} from "./especialidad.entity";

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

    @ManyToOne(() => PacienteEntity, (paciente) => paciente.historiasClinicas)
    @JoinColumn({name: 'paciente'})
    paciente: PacienteEntity;

    @ManyToOne(()=> EspecialidadEntity, (especialidad)=> especialidad.historiasClinicas )
    @JoinColumn({name: 'especialidad'})
    especialidad: EspecialidadEntity;

    @ManyToOne(()=> EmpleadoEntity, (doctor)=> doctor.historiasClinicas )
    @JoinColumn({name: 'doctor'})
    doctor: EmpleadoEntity;
}