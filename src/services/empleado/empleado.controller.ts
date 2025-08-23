import {Body, Controller, Get, Post, Put} from '@nestjs/common';
import {EmpleadoService} from "./empleado.service";
import {RegistrarEmpleadoDTO} from "../../interfaces/register.dto";
import {EmpleadoEntity} from "../../entities/empleado.entity";

@Controller('empleado')
export class EmpleadoController {
    constructor(private readonly empleadoService: EmpleadoService) {}

    @Post()
    create(@Body() dto: RegistrarEmpleadoDTO): Promise<EmpleadoEntity> {
        return this.empleadoService.create(dto);
    }

    @Get('all')
    findAll(): Promise<EmpleadoEntity[]> {
        return this.empleadoService.findAll();
    }
}
