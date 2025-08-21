import {ChildEntity, JoinColumn, ManyToOne, OneToOne} from "typeorm";
import {PersonaEntity} from "./persona.entity";
import {TipoEmpleadoEntity} from "./tipoEmpleado.entity";
import {UserEntity} from "./user.entity";

@ChildEntity('empleado')
export class EmpleadoEntity extends PersonaEntity {

    @ManyToOne(() => TipoEmpleadoEntity, (tipoEmpleado) => tipoEmpleado)
    @JoinColumn({name:'tipo_empleado_id'})
    tipoEmpleado: TipoEmpleadoEntity;

    @OneToOne(() => UserEntity, { nullable: false, eager: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}