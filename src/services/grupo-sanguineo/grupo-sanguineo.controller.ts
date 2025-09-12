import {Controller, Get, Put, Delete, UseGuards, Param, Body} from '@nestjs/common';
import {GrupoSanguineoService} from "src/services/grupo-sanguineo/grupo-sanguineo.service";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {GrupoSanguineoEntity} from "src/entities/grupoSanguineo.entity";
import {CreateGrupoSanguineoDTO} from "src/interfaces/create/create-grupoSanguineo.dto";

@Controller('grupo-sanguineo')
export class GrupoSanguineoController {
    constructor(private readonly grupoSanguineoService: GrupoSanguineoService) {}
    @UseGuards(AuthGuard)
    @Permissions(['GRUPOS_SANGUINEOS_CREATE'])
    @Put('new')
    create(@Body() dto:CreateGrupoSanguineoDTO): Promise<GrupoSanguineoEntity> {
        return this.grupoSanguineoService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['GRUPOS_SANGUINEOS_DELETE'])
    @Delete('delete/:id')
    delete(@Param('id') id:number): Promise<{message:string}> {
        return this.grupoSanguineoService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<GrupoSanguineoEntity[]> {
        return this.grupoSanguineoService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id:number): Promise<GrupoSanguineoEntity> {
        return this.grupoSanguineoService.findById(id);
    }
}
