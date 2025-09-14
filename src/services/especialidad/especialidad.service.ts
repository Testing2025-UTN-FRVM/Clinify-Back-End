import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EspecialidadEntity} from "src/entities/especialidad.entity";
import {Repository} from "typeorm";
import {CreateEspecialidadDto} from "src/interfaces/create/create-especialidad.dto";
import {PatchEspecialidad} from "src/interfaces/patch/patch-especialidad.dto";

@Injectable()
export class EspecialidadService {
    constructor(
        @InjectRepository(EspecialidadEntity)
        private readonly especialidadRepository: Repository<EspecialidadEntity>,
    ) {}

    async create(dto: CreateEspecialidadDto): Promise<EspecialidadEntity> {
        const especialidad = this.especialidadRepository.create(dto);
        return await this.especialidadRepository.save(especialidad);
    }

    async edit(id: number, dto: PatchEspecialidad): Promise<EspecialidadEntity> {
        const especialidad = await this.findOne(id);
        this.especialidadRepository.merge(especialidad, dto);
        return await this.especialidadRepository.save(especialidad);
    }

    async delete(id: number): Promise<{ message: string }> {
        const especialidad = await this.findOne(id);
        await this.especialidadRepository.remove(especialidad);
        return { message: `La especialidad: ${especialidad.nombre} fue eliminada correctamente` };
    }

    async findOne(id: number): Promise<EspecialidadEntity> {
        const especialidad = await this.especialidadRepository.findOneBy({id});
        if (!especialidad) {
            throw new NotFoundException(`El id: ${id} no corresponde a ninguna especialidad`);
        }
        return especialidad;
    }

    async findAll(): Promise<EspecialidadEntity[]> {
        return await this.especialidadRepository.find();
    }
}
