import {IsOptional, IsString} from "class-validator";

export class PatchEspecialidad {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;
}