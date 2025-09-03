import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ConsultorioEntity} from "../../entities/consultorio.entity";
import {Repository} from "typeorm";
import {CreateConsultorioDTO} from "../../interfaces/create/create-consultorio.dto";

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

    async findAll(): Promise<ConsultorioEntity[]> {
        return await this.consultorioRepository.find();
    }

    async findOne(id: number): Promise<ConsultorioEntity> {
        const consultorio = await this.consultorioRepository.findOneBy({id});

        if (!consultorio) {throw new NotFoundException("No existe el consultorio con el id: "+id)}

        return consultorio;
    }
}
