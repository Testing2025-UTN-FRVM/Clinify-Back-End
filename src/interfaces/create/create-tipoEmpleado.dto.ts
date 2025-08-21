import {IsNotEmpty, IsString} from "class-validator";

export class CreateTipoEmpleadoDTO {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;
}