import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ProcedimientoEntity} from "../../entities/procedimiento.entity";
import {Repository} from "typeorm";
import {CreateProcedimientoDTO} from "../../interfaces/create/create-procedimiento.dto";
import {PatchProcedimientoDTO} from "../../interfaces/patch/patch-procedimiento.dto";

@Injectable()
export class ProcedimientoService {
    constructor(
        @InjectRepository(ProcedimientoEntity)
        private readonly procedimientoRepository: Repository<ProcedimientoEntity>,
    ) {}

    async create(dto: CreateProcedimientoDTO): Promise<ProcedimientoEntity> {
        const newProcedimiento = this.procedimientoRepository.create(dto);
        return this.procedimientoRepository.save(newProcedimiento);
    }

    async patch(id: number, dto:PatchProcedimientoDTO): Promise<ProcedimientoEntity> {
        const procedimiento = await this.findOne(id);
        const patchedProcedimiento = this.procedimientoRepository.merge(procedimiento, dto);
        return this.procedimientoRepository.save(patchedProcedimiento);
    }

    async delete(id: number): Promise<{ message: string }> {
        const procedimiento = await this.findOne(id);
        await this.procedimientoRepository.remove(procedimiento);
        return { message: `Procedimiento: ${procedimiento.nombre} eliminado correctamente` };

    }

    async findAll(): Promise<ProcedimientoEntity[]> {
        return this.procedimientoRepository.find();
    }

    async findOne(id: number): Promise<ProcedimientoEntity> {
        const procedimiento = await this.procedimientoRepository.findOneBy({id})

        if(!procedimiento){ throw new NotFoundException("No existe el procedimiento con el id: "+id) }

        return procedimiento;
    }
}
