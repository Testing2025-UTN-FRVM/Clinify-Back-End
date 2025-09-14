import {IsNotEmpty, IsString} from "class-validator";

export class CreateGrupoSanguineoDTO {
    @IsNotEmpty()
    @IsString()
    nombre: string;
}