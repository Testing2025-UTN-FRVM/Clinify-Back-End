import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {ProcedimientoService} from "./procedimiento.service";
import {CreateProcedimientoDTO} from "../../interfaces/create/create-procedimiento.dto";
import {ProcedimientoEntity} from "../../entities/procedimiento.entity";
import {PatchProcedimientoDTO} from "../../interfaces/patch/patch-procedimiento.dto";

@Controller('procedimiento')
export class ProcedimientoController {
    constructor(private readonly procedimientoService: ProcedimientoService) {}

    @Post('new')
    createProcedimiento(@Body() dto:CreateProcedimientoDTO): Promise<ProcedimientoEntity> {
        return this.procedimientoService.create(dto);
    }

    @Get('all')
    findAll(): Promise<ProcedimientoEntity[]> {
        return this.procedimientoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id:number): Promise<ProcedimientoEntity> {
        return this.procedimientoService.findOne(id);
    }

    @Patch(':id')
    patch(@Param('id') id:number, @Body() dto:PatchProcedimientoDTO): Promise<ProcedimientoEntity> {
        return this.procedimientoService.patch(id,dto);
    }

    @Delete(':id')
    delete(@Param('id') id:number): Promise<{ message: string }> {
        return this.procedimientoService.delete(id);
    }
}
