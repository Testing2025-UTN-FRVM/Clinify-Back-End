import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EstadoTurnoEntity} from "src/entities/estadoTurno.entity";
import {Repository} from "typeorm";
import {CreateEstadoTurnoDTO} from "src/interfaces/create/create-estadoTurno.dto";
import {PatchEstadoTurnoDTO} from "src/interfaces/patch/patch-estadoTurno.dto";

@Injectable()
export class EstadoTurnoService {
    constructor(
        @InjectRepository(EstadoTurnoEntity)
        private readonly estadoTurnoRepository: Repository<EstadoTurnoEntity>,
    ) {}

    async create(dto: CreateEstadoTurnoDTO): Promise<EstadoTurnoEntity> {
        const estadoTurno = this.estadoTurnoRepository.create(dto);
        return await this.estadoTurnoRepository.save(estadoTurno);
    }

    async edit(id:number, dto: PatchEstadoTurnoDTO): Promise<EstadoTurnoEntity> {
        const estadoTurno = await this.findOne(id);
        this.estadoTurnoRepository.merge(estadoTurno, dto);
        return await this.estadoTurnoRepository.save(estadoTurno);
    }

    async delete(id: number): Promise<{message: string}> {
        const estadoTurno = await this.findOne(id);
        await this.estadoTurnoRepository.remove(estadoTurno);
        return {message: "El estado de turno: "+estadoTurno.nombre+" fue eliminado correctamente"}
    }

    async findOne(id: number): Promise<EstadoTurnoEntity> {
        const estadoTurno = await this.estadoTurnoRepository.findOneBy({id});
        if (!estadoTurno){ throw new Error("No existe el estado de turno con el id: "+id); }
        return estadoTurno;
    }

    async findAll(): Promise<EstadoTurnoEntity[]> {
        return await this.estadoTurnoRepository.find();
    }
}
