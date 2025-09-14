import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {RolesService} from "src/services/roles/roles.service";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {CreateRoleDTO} from "src/interfaces/create/create-role.dto";
import {RoleEntity} from "src/entities/role.entity";
import {AssignPermissionsDTO} from "src/interfaces/assign.dto";

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @UseGuards(AuthGuard)
    @Permissions(['ROLES_CREATE'])
    @Post('new')
    create(@Body() dto:CreateRoleDTO): Promise<RoleEntity> {
        return this.rolesService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['ROLES_EDIT'])
    @Patch('edit/:id')
    update(@Body() dto:CreateRoleDTO, @Param('id') id:number): Promise<RoleEntity> {
        return this.rolesService.update(id,dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['ROLES_DELETE'])
    @Delete('delete/:id')
    delete(@Param('id') id:number): Promise<{message:string}> {
        return this.rolesService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<RoleEntity[]> {
        return this.rolesService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id:number): Promise<RoleEntity> {
        return this.rolesService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['ROLES_EDIT'])
    @Patch('assign-permissions/:id')
    assignPermissions(@Param('id') id:number, @Body() dto:AssignPermissionsDTO): Promise<RoleEntity> {
        return this.rolesService.assignPermissions(id,dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['ROLES_EDIT'])
    @Delete('remove-permission/:id/:permissionId')
    removePermission(@Param('id') id:number, @Param('permissionId') permissionId:number): Promise<{message:string}> {
        return this.rolesService.removePermission(id,permissionId);
    }
}
