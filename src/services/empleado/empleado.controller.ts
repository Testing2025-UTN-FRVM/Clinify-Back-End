import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {EmpleadoService} from "./empleado.service";
import {RegistrarEmpleadoDTO} from "src/interfaces/register.dto";
import {EmpleadoEntity} from "src/entities/empleado.entity";
import {AuthGuard} from "src/middlewares/auth.middleware";
import * as requestUser from "src/interfaces/JWT/request-user";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {
    AssignProcedimientosEmpleadoDTO,
    PatchConsultorioEmpleadoDTO,
    PatchEspecialidadEmpleadoDTO,
    PatchTipoEmpleadoDTO
} from "src/interfaces/patch/patch-empleado.dto";

@Controller('empleados')
export class EmpleadoController {
    constructor(private readonly empleadoService: EmpleadoService) {}

    @UseGuards(AuthGuard)
    @Permissions(['EMPLEADOS_CREATE'])
    @Post()
    create(@Body() dto: RegistrarEmpleadoDTO): Promise<EmpleadoEntity> {
        return this.empleadoService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('me')
    me(@Req() req: requestUser.RequestWithUser) {
        return this.empleadoService.findByUser(req.user);
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('all')
    findAll(): Promise<EmpleadoEntity[]> {
        return this.empleadoService.findAll();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get('doctors')
    findAllDoctors(): Promise<EmpleadoEntity[]> {
        return this.empleadoService.findAllDoctors();
    }

    @UseGuards(AuthGuard)
    @Permissions(['BASE_ACCESS'])
    @Get(':id')
    findOne(@Param('id') id:number): Promise<EmpleadoEntity> {
        return this.empleadoService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Permissions(['EMPLEADOS_EDIT'])
    @Patch(':id/change-tipo')
    changeTipoEmpleado(@Param('id') id:number, @Body() dto:PatchTipoEmpleadoDTO): Promise<EmpleadoEntity> {
        return this.empleadoService.changeTipoEmpleado(id,dto.idTipoEmpleado);
    }

    @UseGuards(AuthGuard)
    @Permissions(['EMPLEADOS_EDIT'])
    @Patch(':id/especialidad')
    changeEspecialidad(@Param('id') id:number, @Body() dto:PatchEspecialidadEmpleadoDTO): Promise<EmpleadoEntity> {
        return this.empleadoService.assignEspecialidad(id,dto.idEspecialidad);
    }

    @UseGuards(AuthGuard)
    @Permissions(['EMPLEADOS_EDIT'])
    @Patch(':id/procedimientos')
    assignProcedimientos(@Param('id') id:number, @Body() dto:AssignProcedimientosEmpleadoDTO): Promise<EmpleadoEntity> {
        return this.empleadoService.assignProcedimiento(id,dto)
    }

    @UseGuards(AuthGuard)
    @Permissions(['EMPLEADOS_EDIT'])
    @Patch(':id/consultorio')
    changeConsultorio(@Param('id') id:number, @Body() dto:PatchConsultorioEmpleadoDTO): Promise<EmpleadoEntity> {
        return this.empleadoService.assignConsultorio(id,dto.idConsultorio);
    }
}
