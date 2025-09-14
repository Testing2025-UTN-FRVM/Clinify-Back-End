import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {PersonaEntity} from "src/entities/persona.entity";
import {EntityManager, Repository} from "typeorm";
import {RegistrarPersonaDTO} from "src/interfaces/register.dto";
import {PatchPersonaDTO} from "src/interfaces/patch.dto";

@Injectable()
export class PersonaService {
    constructor(
        @InjectRepository(PersonaEntity)
        private readonly personaRepository: Repository<PersonaEntity>,
    ) {}

    async create(dto: RegistrarPersonaDTO,manager?: EntityManager): Promise<PersonaEntity> {

        const repo = manager? manager.getRepository(PersonaEntity) : this.personaRepository;

        const newPersona = repo.create({
            nombre: dto.nombre,
            apellido: dto.apellido,
            fechaNacimiento: dto.fechaNacimiento,
            tipoDocumento: dto.tipoDocumento,
            numeroDocumento: dto.nroDocumento,
            telefono: dto.telefono,
        });
        return repo.save(newPersona);
    }

    async edit(id: number, dto: PatchPersonaDTO): Promise<PersonaEntity> {
        const persona = await this.findOne(id);
        this.personaRepository.merge(persona, dto);
        return await this.personaRepository.save(persona);
    }

    private async findOne(id: number): Promise<PersonaEntity> {
        const persona = await this.personaRepository.findOneBy({id});
        if (!persona) {throw new Error("No existe la persona con el id: "+id)}
        return persona;
    }
}
