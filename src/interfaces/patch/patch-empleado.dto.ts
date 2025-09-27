import {IsArray, IsNotEmpty, IsNumber} from "class-validator";

export class PatchTipoEmpleadoDTO {
    @IsNumber()
    @IsNotEmpty()
    idTipoEmpleado: number;
}

export class PatchEspecialidadDTO {
    @IsNumber()
    @IsNotEmpty()
    idEspecialidad: number;
}

export class PatchConsultorioDTO {
    @IsNumber()
    @IsNotEmpty()
    idConsultorio: number;
}

export class AssignProcedimientosDTO {
    @IsNumber({},{each: true})
    @IsNotEmpty()
    @IsArray()
    procedimientosIds: number[];
}
