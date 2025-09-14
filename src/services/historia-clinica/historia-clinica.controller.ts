import {Body, Controller, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import {HistoriaClinicaService} from "src/services/historia-clinica/historia-clinica.service";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import * as requestUser from "src/interfaces/JWT/request-user";
import {CreateHistoriaClinicaDTO} from "src/interfaces/create/create-historiaClinica.dto";
import {HistoriaClinicaEntity} from "src/entities/historiaClinica.entity";
import {PatchHistoriaClinicaDTO} from "src/interfaces/patch/patch-historiaClinica.dto";

@Controller('historias')
export class HistoriaClinicaController {
    constructor(private readonly historiaClinicaService: HistoriaClinicaService) {}

    @UseGuards(AuthGuard)
    @Permissions(['HISTORIAS_CREATE'])
    @Post('new')
    create(@Req() req: requestUser.RequestWithUser, @Body() dto: CreateHistoriaClinicaDTO): Promise<HistoriaClinicaEntity> {
        return this.historiaClinicaService.create(dto, req.user);
    }

    @UseGuards(AuthGuard)
    @Permissions(['HISTORIAS_EDIT'])
    @Patch('edit/:id')
    edit(@Req() req: requestUser.RequestWithUser, @Body() dto: PatchHistoriaClinicaDTO, @Param('id') id: number): Promise<HistoriaClinicaEntity> {
        return this.historiaClinicaService.edit(id, dto, req.user);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id: number): Promise<HistoriaClinicaEntity> {
        return this.historiaClinicaService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('patient/:id')
    findByPatient(@Param('id') id: number): Promise<HistoriaClinicaEntity[]> {
        return this.historiaClinicaService.findByPatient(id);
    }

}
