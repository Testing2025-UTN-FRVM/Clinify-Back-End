import {IsNotEmpty, IsString} from "class-validator";

export class CreatePermissionDTO {
    @IsString()
    @IsNotEmpty()
    code: string;
}