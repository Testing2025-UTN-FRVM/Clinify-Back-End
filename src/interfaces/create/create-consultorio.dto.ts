import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateConsultorioDTO {
    @IsNumber()
    @IsNotEmpty()
    numero: number;

    @IsString()
    @IsNotEmpty()
    observaciones: string;
}