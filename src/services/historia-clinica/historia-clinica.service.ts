import {ConflictException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {HistoriaClinicaEntity} from "src/entities/historiaClinica.entity";
import {Repository} from "typeorm";
import {PacienteService} from "src/services/paciente/paciente.service";
import {EmpleadoService} from "src/services/empleado/empleado.service";
import {CreateHistoriaClinicaDTO} from "src/interfaces/create/create-historiaClinica.dto";
import {UserEntity} from "src/entities/user.entity";
import {PatchHistoriaClinicaDTO} from "src/interfaces/patch/patch-historiaClinica.dto";

@Injectable()
export class HistoriaClinicaService {
    constructor(
        @InjectRepository(HistoriaClinicaEntity)
        private readonly historiaClinicaRepository: Repository<HistoriaClinicaEntity>,

        private readonly pacienteService: PacienteService,
        private readonly empleadoService: EmpleadoService,
    ) {}

    async create(dto: CreateHistoriaClinicaDTO, user: UserEntity): Promise<HistoriaClinicaEntity> {
        const paciente = await this.pacienteService.findOne(dto.paciente)
        const doctor = await this.empleadoService.findByUser(user)

        const historia = this.historiaClinicaRepository.create({
            fechaEntrada: new Date(),
            entrada: dto.entrada,
            observacionExtra: dto.observacionExtra,
            paciente,
            doctor
        })

        return this.historiaClinicaRepository.save(historia)
    }

    async edit(id: number, dto: PatchHistoriaClinicaDTO, user:UserEntity): Promise<HistoriaClinicaEntity> {
        const historia = await this.findOne(id);

        if(user !== historia.doctor.user){
            throw new ConflictException("No tienes permisos para editar esta historia clinica");
        }

        if(Math.abs(new Date().getTime() - historia.fechaEntrada.getTime()) > 15 * 60 * 1000) {
            throw new ConflictException("No puedes editar una historia clinica que ya ha pasado 15 minutos");
        }

        this.historiaClinicaRepository.merge(historia, dto);
        return this.historiaClinicaRepository.save(historia);

    }

    async findByPatient(patient: number): Promise<HistoriaClinicaEntity[]> {
        return await this.historiaClinicaRepository.find({
            where: {
                paciente: {
                    id: patient
                }
            }
        });
    }

    async findOne(id: number): Promise<HistoriaClinicaEntity> {
        const historia = await this.historiaClinicaRepository.findOneBy({id});
        if (!historia) {
            throw new Error(`El id: ${id} no corresponde a ninguna historia clinica`);
        }
        return historia;
    }


}
