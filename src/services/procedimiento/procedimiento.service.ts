import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ProcedimientoEntity} from "../../entities/procedimiento.entity";
import {Repository} from "typeorm";

@Injectable()
export class ProcedimientoService {
    constructor(
        @InjectRepository(ProcedimientoEntity)
        private readonly procedimientoRepository: Repository<ProcedimientoEntity>,
    ) {}

    async findOne(id: number): Promise<ProcedimientoEntity> {
        const procedimiento = await this.procedimientoRepository.findOneBy({id})

        if(!procedimiento){ throw new NotFoundException("No existe el procedimiento con el id: "+id) }

        return procedimiento;
    }
}
