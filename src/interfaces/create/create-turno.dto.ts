import {IsDateString, IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateTurnoDTO {
    @IsDateString()
    @IsNotEmpty()
    fechaHoraTurno: string;

    @IsNotEmpty()
    @IsString()
    motivo: string;

    @IsNotEmpty()
    @IsNumber()
    procedimiento: number;

    @IsNotEmpty()
    @IsNumber()
    estado: number;

    @IsNotEmpty()
    @IsNumber()
    doctor: number;

    @IsNotEmpty()
    @IsNumber()
    paciente: number;

    @IsNotEmpty()
    @IsNumber()
    especialidad: number;
}