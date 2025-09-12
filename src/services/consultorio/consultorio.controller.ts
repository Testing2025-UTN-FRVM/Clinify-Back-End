import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {ConsultorioService} from "src/services/consultorio/consultorio.service";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {CreateConsultorioDTO} from "src/interfaces/create/create-consultorio.dto";
import {ConsultorioEntity} from "src/entities/consultorio.entity";
import {PatchConsultorioDTO} from "src/interfaces/patch/patch-consultorio.dto";

@Controller('consultorios')
export class ConsultorioController {
    constructor(private readonly consultorioService: ConsultorioService) {}

    @UseGuards(AuthGuard)
    @Permissions(['CONSULTORIOS_CREATE'])
    @Post('new')
    create(@Body() dto: CreateConsultorioDTO): Promise<ConsultorioEntity> {
        return this.consultorioService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['CONSULTORIOS_EDIT'])
    @Patch('edit/:id')
    edit(@Body() dto: PatchConsultorioDTO, @Param('id') id: number): Promise<ConsultorioEntity> {
        return this.consultorioService.edit(id, dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['CONSULTORIOS_DELETE'])
    @Delete('delete/:id')
    delete(@Param('id') id: number): Promise<{message: string}> {
        return this.consultorioService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<ConsultorioEntity[]> {
        return this.consultorioService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id: number): Promise<ConsultorioEntity> {
        return this.consultorioService.findOne(id);
    }
}
