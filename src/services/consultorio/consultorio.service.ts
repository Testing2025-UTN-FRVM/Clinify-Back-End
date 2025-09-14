import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ConsultorioEntity} from "src/entities/consultorio.entity";
import {Repository} from "typeorm";
import {CreateConsultorioDTO} from "src/interfaces/create/create-consultorio.dto";
import {PatchConsultorioDTO} from "src/interfaces/patch/patch-consultorio.dto";

@Injectable()
export class ConsultorioService {
    constructor(
        @InjectRepository(ConsultorioEntity)
        private readonly consultorioRepository: Repository<ConsultorioEntity>,
    ) {}

    async create(dto: CreateConsultorioDTO): Promise<ConsultorioEntity> {
        const consultorio = this.consultorioRepository.create(dto);
        return await this.consultorioRepository.save(consultorio);
    }

    async edit(id: number, dto: PatchConsultorioDTO): Promise<ConsultorioEntity> {
        const consultorio = await this.findOne(id);
        this.consultorioRepository.merge(consultorio, dto);
        return await this.consultorioRepository.save(consultorio);
    }

    async delete(id: number): Promise<{message: string}> {
        const consultorio = await this.findOne(id);
        await this.consultorioRepository.remove(consultorio);
        return {message: 'El consultorio: '+consultorio.numero+' fue eliminado correctamente'}

    }

    async findAll(): Promise<ConsultorioEntity[]> {
        return await this.consultorioRepository.find();
    }

    async findOne(id: number): Promise<ConsultorioEntity> {
        const consultorio = await this.consultorioRepository.findOneBy({id});

        if (!consultorio) {throw new NotFoundException("No existe el consultorio con el id: "+id)}

        return consultorio;
    }
}
