import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {PermissionsService} from "src/services/permissions/permissions.service";
import {CreatePermissionDTO} from "src/interfaces/create/create-permission.dto";
import {PermissionEntity} from "src/entities/permission.entity";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";

@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @UseGuards(AuthGuard)
    @Permissions(['PERMISSIONS_CREATE'])
    @Post('new')
    create(@Body() dto: CreatePermissionDTO): Promise<PermissionEntity> {
        return this.permissionsService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['PERMISSIONS_EDIT'])
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: CreatePermissionDTO): Promise<PermissionEntity> {
        return this.permissionsService.update(id, dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['PERMISSIONS_DELETE'])
    @Delete('delete/:id')
    delete(@Param('id') id: number): Promise<{message:string}> {
        return this.permissionsService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<PermissionEntity[]> {
        return this.permissionsService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id: number): Promise<PermissionEntity> {
        return this.permissionsService.findOne(id);
    }

}
