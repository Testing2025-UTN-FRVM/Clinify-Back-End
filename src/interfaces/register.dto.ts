import {IsDate, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {IsPersonaDocUnique} from "../common/validators/persona-doc-unique.validator";
import {IsUniqueEmail} from "../common/validators/unique-email.validator";

export class RegistrarPersonaDTO {
    //Persona
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsDate()
    @IsNotEmpty()
    fechaNacimiento: Date;

    @IsString()
    @IsNotEmpty()
    tipoDocumento: string;

    @IsString()
    @IsNotEmpty()
    @IsPersonaDocUnique('tipoDocumento', 'nroDocumento')
    nroDocumento: string;

    @IsString()
    @IsNotEmpty()
    telefono: string;
}

export class RegistrarEmpleadoDTO extends RegistrarPersonaDTO {
    //User
    @IsString()
    @IsNotEmpty()
    @IsUniqueEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    //Empleado
    @IsNumber()
    @IsNotEmpty()
    idTipoEmpleado: number;

    //Doctor
    @IsNumber()
    @IsOptional()
    idEspecialidad?: number;

    @IsNumber()
    @IsOptional()
    idConsultorio?: number;


}

export class RegistrarPacienteDTO extends RegistrarPersonaDTO {
    @IsNumber()
    @IsNotEmpty()
    altura: number;

    @IsNumber()
    @IsNotEmpty()
    peso: number;

    @IsString()
    observaciones: string;

    @IsNumber()
    @IsNotEmpty()
    idGrupoSanguineo: number;
}