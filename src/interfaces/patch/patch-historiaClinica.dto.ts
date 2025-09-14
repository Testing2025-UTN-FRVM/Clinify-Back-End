import {IsOptional, IsString} from "class-validator";

export class PatchHistoriaClinicaDTO {
    @IsOptional()
    @IsString()
    entrada?: string;

    @IsOptional()
    @IsString()
    observacionExtra?: string;
}