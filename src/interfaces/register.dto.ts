import {IsDate, IsNotEmpty, IsNumber, IsString} from "class-validator";

export type TipoUsuario = 'user' | 'empleado' | 'paciente';

export class RegistrarEmpleadoDTO {
    tipo: TipoUsuario;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    //Persona
    @IsString()
    nombre: string;

    @IsString()
    apellido: string;

    @IsDate()
    fechaNacimiento: Date; // ISO date string

    @IsString()
    tipoDocumento: string; // e.g., 'DNI', 'Passport'

    @IsString()
    nroDocumento: string; // e.g., '12345678'

    @IsString()
    telefono: string; // e.g., '123-456-7890'

    //Empleado
    @IsNumber()
    idTipoEmpleado: number;
}