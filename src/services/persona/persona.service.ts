import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {PersonaEntity} from "../../entities/persona.entity";
import {EntityManager, Repository} from "typeorm";
import {RegistrarPersonaDTO} from "../../interfaces/register.dto";

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
}
