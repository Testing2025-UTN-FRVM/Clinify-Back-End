import {Body, Controller, Put, Patch, Get, Delete, UseGuards, Param} from '@nestjs/common';
import {TipoEmpleadoService} from "src/services/tipo-empleado/tipo-empleado.service";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {CreateTipoEmpleadoDTO} from "src/interfaces/create/create-tipoEmpleado.dto";
import {TipoEmpleadoEntity} from "src/entities/tipoEmpleado.entity";

@Controller('tipos-empleado')
export class TipoEmpleadoController {
    constructor(private readonly tipoEmpleadoService: TipoEmpleadoService) {}

    @UseGuards(AuthGuard)
    @Permissions(['TIPOS_EMPLEADO_CREATE'])
    @Put('new')
    create(@Body() dto: CreateTipoEmpleadoDTO): Promise<TipoEmpleadoEntity> {
        return this.tipoEmpleadoService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['TIPOS_EMPLEADO_EDIT'])
    @Patch('edit/:id')
    edit(@Body() dto: CreateTipoEmpleadoDTO, @Param('id') id: number): Promise<TipoEmpleadoEntity> {
        return this.tipoEmpleadoService.edit(id, dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['TIPOS_EMPLEADO_DELETE'])
    @Delete('delete/:id')
    delete(@Param('id') id: number): Promise<{message:string}> {
        return this.tipoEmpleadoService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<TipoEmpleadoEntity[]> {
        return this.tipoEmpleadoService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id: number): Promise<TipoEmpleadoEntity> {
        return this.tipoEmpleadoService.findOne(id);
    }
}
