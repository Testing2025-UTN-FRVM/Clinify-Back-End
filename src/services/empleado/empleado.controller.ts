import {Body, Controller, Get, Post, Put, Req, UseGuards} from '@nestjs/common';
import {EmpleadoService} from "./empleado.service";
import {RegistrarEmpleadoDTO} from "src/interfaces/register.dto";
import {EmpleadoEntity} from "src/entities/empleado.entity";
import {AuthGuard} from "src/middlewares/auth.middleware";
import * as requestUser from "src/interfaces/JWT/request-user";

@Controller('empleados')
export class EmpleadoController {
    constructor(private readonly empleadoService: EmpleadoService) {}

    @Post()
    create(@Body() dto: RegistrarEmpleadoDTO): Promise<EmpleadoEntity> {
        return this.empleadoService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    me(@Req() req: requestUser.RequestWithUser) {
        return this.empleadoService.findByUser(req.user);
    }

    @Get('all')
    findAll(): Promise<EmpleadoEntity[]> {
        return this.empleadoService.findAll();
    }
}
