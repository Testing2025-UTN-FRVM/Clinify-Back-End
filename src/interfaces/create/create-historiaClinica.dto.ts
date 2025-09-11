import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateHistoriaClinicaDTO {
    @IsNotEmpty()
    @IsString()
    entrada: string;

    @IsOptional()
    @IsString()
    observacionExtra?: string;

    @IsNotEmpty()
    @IsNumber()
    paciente: number;

    @IsNotEmpty()
    @IsNumber()
    doctor: number;
}