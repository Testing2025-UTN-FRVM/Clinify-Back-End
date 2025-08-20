import {ChildEntity, JoinColumn, ManyToOne} from "typeorm";
import {PersonaEntity} from "./persona.entity";
import {TipoEmpleadoEntity} from "./tipoEmpleado.entity";

@ChildEntity('empleado')
export class EmpleadoEntity extends PersonaEntity {

    @ManyToOne(() => TipoEmpleadoEntity, (tipoEmpleado) => tipoEmpleado)
    @JoinColumn({name:'tipo_empleado_id'})
    tipoEmpleado: TipoEmpleadoEntity;
}