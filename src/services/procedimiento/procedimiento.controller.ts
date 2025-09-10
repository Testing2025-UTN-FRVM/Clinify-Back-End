import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {ProcedimientoService} from "./procedimiento.service";
import {CreateProcedimientoDTO} from "../../interfaces/create/create-procedimiento.dto";
import {ProcedimientoEntity} from "../../entities/procedimiento.entity";
import {PatchProcedimientoDTO} from "../../interfaces/patch/patch-procedimiento.dto";
import {AuthGuard} from "../../middlewares/auth.middleware";
import {Permissions} from "../../middlewares/decorators/permissions.decorator";

@Controller('procedimiento')
export class ProcedimientoController {
    constructor(private readonly procedimientoService: ProcedimientoService) {}

    @UseGuards(AuthGuard)
    @Permissions(['PROCEDIMIENTOS_CREATE'])
    @Post('new')
    createProcedimiento(@Body() dto:CreateProcedimientoDTO): Promise<ProcedimientoEntity> {
        return this.procedimientoService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<ProcedimientoEntity[]> {
        return this.procedimientoService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id:number): Promise<ProcedimientoEntity> {
        return this.procedimientoService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['PROCEDIMIENTOS_EDIT'])
    @Patch(':id')
    patch(@Param('id') id:number, @Body() dto:PatchProcedimientoDTO): Promise<ProcedimientoEntity> {
        return this.procedimientoService.patch(id,dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['PROCEDIMIENTOS_DELETE'])
    @Delete(':id')
    delete(@Param('id') id:number): Promise<{ message: string }> {
        return this.procedimientoService.delete(id);
    }
}
