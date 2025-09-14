import {IsNotEmpty, IsString} from "class-validator";

export class CreateEstadoTurnoDTO {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    descripcion: string;
}