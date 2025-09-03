import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {PacienteEntity} from "../../entities/paciente.entity";
import {DataSource, Repository} from "typeorm";
import {RegistrarPacienteDTO} from "../../interfaces/register.dto";
import {GrupoSanguineoService} from "../grupo-sanguineo/grupo-sanguineo.service";
import {PersonaService} from "../persona/persona.service";

@Injectable()
export class PacienteService {
    constructor(
        private readonly grupoSanguineoService: GrupoSanguineoService,
        private readonly personaService: PersonaService,

        @InjectRepository(PacienteEntity)
        private readonly pacienteRepository: Repository<PacienteEntity>,

        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {}

    async create(dto: RegistrarPacienteDTO): Promise<PacienteEntity> {
        try{
            return await this.dataSource.transaction(async manager => {
                const grupoSanguineo = await this.grupoSanguineoService.findById(dto.idGrupoSanguineo);

                const persona = await this.personaService.create(dto,manager);

                const paciente = this.pacienteRepository.create({
                    altura: dto.altura,
                    peso: dto.peso,
                    observaciones: dto.observaciones,
                    persona: persona,
                    grupoSanguineo: grupoSanguineo
                });

                return manager.getRepository(PacienteEntity).save(paciente);
            })

        }catch (error) {
            throw new Error(error.message,error.stack);
        }
    }

    async findOne(id: number): Promise<PacienteEntity> {
        const paciente = await this.pacienteRepository.findOne({where: {id}, relations: ['grupoSanguineo','persona']});
        if (!paciente) {
            throw new NotFoundException(`El id: ${id} no corresponde a ningun paciente`);
        }
        return paciente;
    }

    async findAll(): Promise<PacienteEntity[]> {
        return this.pacienteRepository.find({ relations: ['grupoSanguineo']});
    }
}
