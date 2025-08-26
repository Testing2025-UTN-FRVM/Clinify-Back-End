import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {PacienteEntity} from "../../entities/paciente.entity";
import {Repository} from "typeorm";
import {RegistrarPacienteDTO} from "../../interfaces/register.dto";
import {GrupoSanguineoService} from "../grupo-sanguineo/grupo-sanguineo.service";

@Injectable()
export class PacienteService {
    constructor(
        private readonly grupoSanguineoService: GrupoSanguineoService,

        @InjectRepository(PacienteEntity)
        private readonly pacienteRepository: Repository<PacienteEntity>,
    ) {}

    async create(dto: RegistrarPacienteDTO): Promise<PacienteEntity> {
        try{
            const grupoSanguineo = await this.grupoSanguineoService.findById(dto.idGrupoSanguineo);

            const paciente = this.pacienteRepository.create({
                nombre: dto.nombre,
                apellido: dto.apellido,
                fechaNacimiento: dto.fechaNacimiento,
                tipoDocumento: dto.tipoDocumento,
                numeroDocumento: dto.nroDocumento,
                telefono: dto.telefono,
                altura: dto.altura,
                peso: dto.peso,
                observaciones: dto.observaciones,
                grupoSanguineo: grupoSanguineo
            });

            return this.pacienteRepository.save(paciente);

        }catch (error) {
            throw new Error(error.message,error.stack);
        }
    }

    async findAll(): Promise<PacienteEntity[]> {
        return this.pacienteRepository.find({ relations: ['grupoSanguineo']});
    }
}
