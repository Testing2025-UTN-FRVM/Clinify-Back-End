import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {GrupoSanguineoEntity} from "src/entities/grupoSanguineo.entity";
import {Repository} from "typeorm";
import {CreateGrupoSanguineoDTO} from "src/interfaces/create/create-grupoSanguineo.dto";

@Injectable()
export class GrupoSanguineoService {
    constructor(
        @InjectRepository(GrupoSanguineoEntity)
        private readonly grupoSanguineoRepository: Repository<GrupoSanguineoEntity>,
    ) {}

    async create(dto: CreateGrupoSanguineoDTO): Promise<GrupoSanguineoEntity> {
        const grupoSanguineo = this.grupoSanguineoRepository.create(dto);
        return await this.grupoSanguineoRepository.save(grupoSanguineo);
    }

    async delete(id: number): Promise<{message: string}> {
        const grupoSanguineo = await this.findById(id);
        await this.grupoSanguineoRepository.remove(grupoSanguineo);
        return {message: "El grupo sanguineo: "+grupoSanguineo.nombre+" fue eliminado correctamente"}
    }

    async findAll(): Promise<GrupoSanguineoEntity[]> {
        return await this.grupoSanguineoRepository.find();
    }

    async findById(id:number): Promise<GrupoSanguineoEntity> {
        const grupoSanguineo = await this.grupoSanguineoRepository.findOneBy({id});
        if (!grupoSanguineo){ throw new NotFoundException("No existe el grupo sanguineo con el id: "+id); }
        return grupoSanguineo;
    }
}
