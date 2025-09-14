import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {EstadoTurnoService} from "src/services/estado-turno/estado-turno.service";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {CreateEstadoTurnoDTO} from "src/interfaces/create/create-estadoTurno.dto";
import {EstadoTurnoEntity} from "src/entities/estadoTurno.entity";
import {PatchEstadoTurnoDTO} from "src/interfaces/patch/patch-estadoTurno.dto";

@Controller('estados-turno')
export class EstadoTurnoController {
    constructor(private readonly estadoTurnoService: EstadoTurnoService) {}

    @UseGuards(AuthGuard)
    @Permissions(['ESTADOS_TURNO_CREATE'])
    @Post('new')
    create(@Body() dto: CreateEstadoTurnoDTO): Promise<EstadoTurnoEntity> {
        return this.estadoTurnoService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['ESTADOS_TURNO_EDIT'])
    @Patch('edit/:id')
    edit(@Param('id') id:number , @Body() dto: PatchEstadoTurnoDTO): Promise<EstadoTurnoEntity> {
        return this.estadoTurnoService.edit(id, dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['ESTADOS_TURNO_DELETE'])
    @Delete('delete/:id')
    delete(@Param('id') id:number): Promise<{ message: string }> {
        return this.estadoTurnoService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<EstadoTurnoEntity[]> {
        return this.estadoTurnoService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id:number): Promise<EstadoTurnoEntity> {
        return this.estadoTurnoService.findOne(id);
    }
}
