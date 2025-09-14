import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {EspecialidadService} from "src/services/especialidad/especialidad.service";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {CreateEspecialidadDto} from "src/interfaces/create/create-especialidad.dto";
import {EspecialidadEntity} from "src/entities/especialidad.entity";
import {PatchEspecialidad} from "src/interfaces/patch/patch-especialidad.dto";

@Controller('especialidades')
export class EspecialidadController {
    constructor(private readonly especialidadService: EspecialidadService) {}

    @UseGuards(AuthGuard)
    @Permissions(['ESPECIALIDADES_CREATE'])
    @Post('new')
    create(@Body() dto: CreateEspecialidadDto): Promise<EspecialidadEntity> {
        return this.especialidadService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['ESPECIALIDADES_EDIT'])
    @Patch('edit/:id')
    edit(@Body() dto: PatchEspecialidad, @Param('id') id: number): Promise<EspecialidadEntity> {
        return this.especialidadService.edit(id, dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['ESPECIALIDADES_DELETE'])
    @Delete('delete/:id')
    delete(@Param('id') id: number): Promise<{message:string}> {
        return this.especialidadService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<EspecialidadEntity[]> {
        return this.especialidadService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id: number): Promise<EspecialidadEntity> {
        return this.especialidadService.findOne(id);
    }
}
