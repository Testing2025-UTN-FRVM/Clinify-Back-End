import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {TurnoService} from "./turno.service";
import {CreateTurnoDTO} from "src/interfaces/create/create-turno.dto";
import {TurnoEntity} from "src/entities/turno.entity";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";

@Controller('turno')
export class TurnoController {
    constructor(private readonly turnoService: TurnoService) {}

    @UseGuards(AuthGuard)
    @Permissions(['TURNOS_CREATE'])
    @Post('agendar')
    agendarTurno(@Body() body: CreateTurnoDTO): Promise<TurnoEntity> {
        return this.turnoService.agendarTurno(body);
    }
}
