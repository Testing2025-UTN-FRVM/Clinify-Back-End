import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateConsultorioDTO {
    @IsNumber({},{message: 'El dato introducido debe ser un numero'})
    @IsNotEmpty({message: 'El numero del consultorio no puede estar vacio'})
    numero: number;

    @IsString({message: 'El dato introducido debe ser un texto'})
    @IsNotEmpty({message: 'La observacion del consultorio no puede estar vacia'})
    observaciones: string;
}