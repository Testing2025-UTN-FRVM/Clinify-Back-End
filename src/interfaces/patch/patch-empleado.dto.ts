import {IsArray, IsNotEmpty, IsNumber} from "class-validator";

export class PatchTipoEmpleadoDTO {
    @IsNumber()
    @IsNotEmpty()
    idTipoEmpleado: number;
}

export class PatchEspecialidadEmpleadoDTO {
    @IsNumber()
    @IsNotEmpty()
    idEspecialidad: number;
}

export class PatchConsultorioEmpleadoDTO {
    @IsNumber()
    @IsNotEmpty()
    idConsultorio: number;
}

export class AssignProcedimientosEmpleadoDTO {
    @IsNumber({},{each: true})
    @IsNotEmpty()
    @IsArray()
    procedimientosIds: number[];
}
