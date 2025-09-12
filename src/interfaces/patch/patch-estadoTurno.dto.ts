import {IsOptional, IsString} from "class-validator";

export class PatchEstadoTurnoDTO {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;
}