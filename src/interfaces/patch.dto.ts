import {IsDate, IsOptional, IsNumber, IsString} from "class-validator";
import {IsPersonaDocUnique} from "src/common/validators/persona-doc-unique.validator";
import {IsUniqueEmail} from "src/common/validators/unique-email.validator";

export class PatchPersonaDTO {
    //Persona
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    apellido?: string;

    @IsDate()
    @IsOptional()
    fechaNacimiento?: Date;

    @IsString()
    @IsOptional()
    tipoDocumento?: string;

    @IsString()
    @IsOptional()
    @IsPersonaDocUnique('tipoDocumento', 'nroDocumento')
    nroDocumento?: string;

    @IsString()
    @IsOptional()
    telefono?: string;
}

export class PatchUserDTO {
    @IsString()
    @IsOptional()
    @IsUniqueEmail()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;
}

export class PatchPacienteDTO {
    @IsNumber()
    @IsOptional()
    altura?: number;

    @IsNumber()
    @IsOptional()
    peso?: number;

    @IsString()
    observaciones?: string;

    @IsNumber()
    @IsOptional()
    idGrupoSanguineo?: number;
}