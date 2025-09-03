import { IsString,IsNotEmpty,IsNumber } from "class-validator";

export class CreateProcedimientoDTO {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNumber()
    @IsNotEmpty()
    duracion: number;
}
