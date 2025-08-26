import {Body, Controller, Get, Post} from '@nestjs/common';
import {PacienteService} from "./paciente.service";
import {RegistrarPacienteDTO} from "../../interfaces/register.dto";
import {PacienteEntity} from "../../entities/paciente.entity";

@Controller('paciente')
export class PacienteController {
    constructor(private readonly pacienteService:PacienteService) {}

    @Post('new')
    create(@Body() dto: RegistrarPacienteDTO): Promise<PacienteEntity> {
        return this.pacienteService.create(dto);
    }

    @Get('all')
    findAll(): Promise<PacienteEntity[]> {
        return this.pacienteService.findAll();
    }
}
