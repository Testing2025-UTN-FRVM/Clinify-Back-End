import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {PersonaEntity} from "../../entities/persona.entity";
import {Repository} from "typeorm";
import {RegistrarPersonaDTO} from "../../interfaces/register.dto";

@Injectable()
export class PersonaService {
    constructor(
        @InjectRepository(PersonaEntity)
        private readonly personaRepository: Repository<PersonaEntity>,
    ) {}

    async create(dto: RegistrarPersonaDTO): Promise<PersonaEntity> {
        const newPersona = this.personaRepository.create({
            nombre: dto.nombre,
            apellido: dto.apellido,
            fechaNacimiento: dto.fechaNacimiento,
            tipoDocumento: dto.tipoDocumento,
            numeroDocumento: dto.nroDocumento,
            telefono: dto.telefono,
        });
        return this.personaRepository.save(newPersona);
    }
}
