import {IsArray, IsNotEmpty, IsNumber} from "class-validator";

export class AssignPermissionsDTO {
    @IsNotEmpty()
    @IsNumber({},{ each: true})
    @IsArray()
    permissionCodes: number[];
}