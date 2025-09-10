import {IsString, IsNumber, IsOptional} from "class-validator";

export class PatchProcedimientoDTO {
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsNumber()
    @IsOptional()
    duracion?: number;
}
