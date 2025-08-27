import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EmpleadoEntity} from "../../entities/empleado.entity";
import {Repository} from "typeorm";
import {RegistrarEmpleadoDTO} from "../../interfaces/register.dto";
import {TipoEmpleadoService} from "../tipo-empleado/tipo-empleado.service";
import {UsersService} from "../users/users.service";
import {EspecialidadService} from "../especialidad/especialidad.service";
import {PersonaService} from "../persona/persona.service";

@Injectable()
export class EmpleadoService {
    constructor(
        private readonly tipoEmpleadoService: TipoEmpleadoService,
        private readonly userService: UsersService,
        private readonly especialidadService: EspecialidadService,
        private readonly personaService: PersonaService,

        @InjectRepository(EmpleadoEntity)
        private readonly empleadoRepository: Repository<EmpleadoEntity>,


    ) {}

    async create(dto: RegistrarEmpleadoDTO): Promise<EmpleadoEntity> {
        try {
            const tipo = await this.tipoEmpleadoService.findOne(dto.idTipoEmpleado);

            //const user = await this.userService.register(dto.email, dto.password);

            //const persona = await this.personaService.create(dto);

            if(tipo.nombre =="Doctor") {

                const especialidad = await this.especialidadService.findOne(dto.idEspecialidad);

                const empleado = this.empleadoRepository.create({
                    persona: await this.personaService.create(dto),
                    user: await this.userService.register(dto.email, dto.password),
                    tipoEmpleado: tipo,
                    especialidad: especialidad,
                });
                return this.empleadoRepository.save(empleado);
            } else {
                const empleado = this.empleadoRepository.create({
                    persona: await this.personaService.create(dto),
                    user: await this.personaService.create(dto),
                    tipoEmpleado: tipo
                });
                return this.empleadoRepository.save(empleado);
            }


        } catch (error) {
            throw new Error(error.message,error.stack);
        }
    }

    async delete(id: number): Promise<void> {
        const emp = await this.findById(id);
        await this.empleadoRepository.remove(emp);
    }

    async findById(id: number): Promise<EmpleadoEntity> {
        const emp = await this.empleadoRepository.findOneBy({id});

        if(!emp){
            throw new NotFoundException("No existe el empleado con el id: "+id);
        }

        return emp;
    }

    async findAll(): Promise<EmpleadoEntity[]> {
        return this.empleadoRepository.createQueryBuilder('e')
            .leftJoinAndSelect('e.user', 'u')
            .leftJoinAndSelect('e.tipoEmpleado', 'te')
            .leftJoinAndSelect('e.especialidad', 'es')
            .select(['e.id','e.nombre','e.apellido','u.email','te.nombre','es.nombre']) // elegís columnas
            .getMany();
    }
}
