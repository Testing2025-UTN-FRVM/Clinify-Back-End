import {IsNumber, IsOptional, IsString} from "class-validator";

export class PatchConsultorioDTO {
    @IsNumber()
    @IsOptional()
    numero?: number;

    @IsString()
    @IsOptional()
    observaciones?: string;
}