import {ChildEntity, Column, Index} from "typeorm";
import {UserEntity} from "./user.entity";

@ChildEntity('persona')
export class PersonaEntity extends UserEntity {
    @Column({nullable: false})
    nombre: string;

    @Column({nullable: false})
    apellido: string;

    @Column({nullable: false})
    fechaNacimiento: Date;

    @Column({nullable: false})
    tipoDocumento: string;

    @Column({nullable: false})
    @Index({unique: true})
    numeroDocumento: string;

    @Column({nullable: true})
    telefono: string;
}