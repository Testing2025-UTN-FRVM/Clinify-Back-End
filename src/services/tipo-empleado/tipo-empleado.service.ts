import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TipoEmpleadoEntity} from "../../entities/tipoEmpleado.entity";
import {CreateTipoEmpleadoDTO} from "../../interfaces/create/create-tipoEmpleado.dto";
import {Repository} from "typeorm";

@Injectable()
export class TipoEmpleadoService {
    constructor(
        @InjectRepository(TipoEmpleadoEntity)
        private tipoEmpleadoRepository: Repository<TipoEmpleadoEntity>,
    ) {
        this.tipoEmpleadoRepository = tipoEmpleadoRepository;
    }

    async create(body: CreateTipoEmpleadoDTO): Promise<TipoEmpleadoEntity> {
        const tipoEmpleado = this.tipoEmpleadoRepository.create(body);
        return this.tipoEmpleadoRepository.save(tipoEmpleado);
    }
    async findAll(): Promise<TipoEmpleadoEntity[]> {
        return this.tipoEmpleadoRepository.find();
    }
    async findOne(id: number): Promise<TipoEmpleadoEntity> {

        const tipoEmpleado = await this.tipoEmpleadoRepository.findOneBy({id});
        if (!tipoEmpleado) {
            throw new NotFoundException(`El id: ${id} no corresponde a ningún tipo de empleado`);
        }
        return tipoEmpleado;
    }
}
