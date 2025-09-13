import {Body, Controller, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {PacienteService} from "./paciente.service";
import {RegistrarPacienteDTO} from "src/interfaces/register.dto";
import {PacienteEntity} from "src/entities/paciente.entity";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {PatchPacienteDTO} from "src/interfaces/patch.dto";

@Controller('paciente')
export class PacienteController {
    constructor(private readonly pacienteService:PacienteService) {}

    @UseGuards(AuthGuard)
    @Permissions(['PACIENTES_CREATE'])
    @Post('new')
    create(@Body() dto: RegistrarPacienteDTO): Promise<PacienteEntity> {
        return this.pacienteService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['PACIENTES_EDIT'])
    @Patch('edit/:id')
    edit(@Body() dto: PatchPacienteDTO, @Param('id') id: number): Promise<PacienteEntity> {
        return this.pacienteService.edit(id, dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<PacienteEntity[]> {
        return this.pacienteService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id:number): Promise<PacienteEntity> {
        return this.pacienteService.findOne(id);
    }
}
