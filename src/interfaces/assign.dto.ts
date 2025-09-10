import {IsArray, IsNotEmpty, IsNumber} from "class-validator";

export class AssignPermissionsDTO {
    @IsNotEmpty()
    @IsNumber({},{ each: true})
    @IsArray()
    permissionCodes: number[];
}

export class AssignRoleDTO {
    @IsNotEmpty()
    @IsNumber({},{ each: true})
    @IsArray()
    roleIds: number[];
}