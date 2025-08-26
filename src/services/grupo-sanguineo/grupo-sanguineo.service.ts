import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {GrupoSanguineoEntity} from "../../entities/grupoSanguineo.entity";
import {Repository} from "typeorm";

@Injectable()
export class GrupoSanguineoService {
    constructor(
        @InjectRepository(GrupoSanguineoEntity)
        private readonly grupoSanguineoRepository: Repository<GrupoSanguineoEntity>,
    ) {}

    async findById(id:number): Promise<GrupoSanguineoEntity> {
        const grupoSanguineo = await this.grupoSanguineoRepository.findOneBy({id});
        if (!grupoSanguineo){ throw new NotFoundException("No existe el grupo sanguineo con el id: "+id); }
        return grupoSanguineo;
    }
}
