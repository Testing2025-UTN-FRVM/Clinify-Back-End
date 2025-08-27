import {
    Entity,
    Column,
    Index,
    BaseEntity,
    PrimaryGeneratedColumn,
    OneToOne
} from "typeorm";
import {EmpleadoEntity} from "./empleado.entity";
import {PacienteEntity} from "./paciente.entity";

@Index('UQ_users_doc', ['tipoDocumento', 'numeroDocumento'], { unique: true })

@Entity('persona')
export class PersonaEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    nombre: string;

    @Column({nullable: false})
    apellido: string;

    @Column({nullable: false})
    fechaNacimiento: Date;

    @Column({nullable: false})
    tipoDocumento: string;

    @Column({nullable: false})
    numeroDocumento: string;

    @Column({nullable: true})
    telefono: string;

    @OneToOne(() => EmpleadoEntity, (empleado) => empleado.persona)
    empleado: EmpleadoEntity;

    @OneToOne(()=> PacienteEntity, (paciente) => paciente.persona)
    paciente: PacienteEntity;
}