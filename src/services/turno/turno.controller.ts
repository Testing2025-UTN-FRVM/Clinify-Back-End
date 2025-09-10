import {Body, Controller, Post} from '@nestjs/common';
import {TurnoService} from "./turno.service";
import {CreateTurnoDTO} from "../../interfaces/create/create-turno.dto";
import {TurnoEntity} from "../../entities/turno.entity";

@Controller('turno')
export class TurnoController {
    constructor(private readonly turnoService: TurnoService) {

    }

    @Post('agendar')
    agendarTurno(@Body() body: CreateTurnoDTO): Promise<TurnoEntity> {
        return this.turnoService.agendarTurno(body);
    }
}
