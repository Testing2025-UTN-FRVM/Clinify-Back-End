import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EstadoTurnoEntity} from "../../entities/estadoTurno.entity";
import {Repository} from "typeorm";

@Injectable()
export class EstadoTurnoService {
    constructor(
        @InjectRepository(EstadoTurnoEntity)
        private readonly estadoTurnoRepository: Repository<EstadoTurnoEntity>,
    ) {}

    async findOne(id: number): Promise<EstadoTurnoEntity> {
        const estadoTurno = await this.estadoTurnoRepository.findOneBy({id});
        if (!estadoTurno){ throw new Error("No existe el estado de turno con el id: "+id); }
        return estadoTurno;
    }

    async findAll(): Promise<EstadoTurnoEntity[]> {
        return await this.estadoTurnoRepository.find();
    }
}
