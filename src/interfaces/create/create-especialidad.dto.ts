import {IsNotEmpty, IsString} from "class-validator";

export class CreateEspecialidadDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    descripcion: string;
}