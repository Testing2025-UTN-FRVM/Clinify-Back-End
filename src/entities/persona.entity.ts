import {Entity, Column, Index, TableInheritance, BaseEntity, PrimaryGeneratedColumn} from "typeorm";

@Index('UQ_users_doc', ['tipoDocumento', 'numeroDocumento'], { unique: true })

@Entity('persona')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
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
}