import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EspecialidadEntity} from "../../entities/especialidad.entity";
import {Repository} from "typeorm";

@Injectable()
export class EspecialidadService {
    constructor(
        @InjectRepository(EspecialidadEntity)
        private readonly especialidadRepository: Repository<EspecialidadEntity>,
    ) {}

    async findOne(id: number): Promise<EspecialidadEntity> {
        const especialidad = await this.especialidadRepository.findOneBy({id});
        if (!especialidad) {
            throw new NotFoundException(`El id: ${id} no corresponde a ninguna especialidad`);
        }
        return especialidad;
    }

    async findAll(): Promise<EspecialidadEntity[]> {
        const especialidades = await this.especialidadRepository.find();
        return especialidades;
    }
}
