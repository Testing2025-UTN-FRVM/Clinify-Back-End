import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {EmpleadoEntity} from "src/entities/empleado.entity";
import {DataSource, Repository} from "typeorm";
import {RegistrarEmpleadoDTO} from "src/interfaces/register.dto";
import {TipoEmpleadoService} from "../tipo-empleado/tipo-empleado.service";
import {UsersService} from "../users/users.service";
import {EspecialidadService} from "../especialidad/especialidad.service";
import {PersonaService} from "../persona/persona.service";
import {UserEntity} from "src/entities/user.entity";

@Injectable()
export class EmpleadoService {
    constructor(
        private readonly tipoEmpleadoService: TipoEmpleadoService,
        private readonly userService: UsersService,
        private readonly especialidadService: EspecialidadService,
        private readonly personaService: PersonaService,

        @InjectRepository(EmpleadoEntity)
        private readonly empleadoRepository: Repository<EmpleadoEntity>,

        @InjectDataSource()
        private readonly dataSource: DataSource


    ) {}

    async create(dto: RegistrarEmpleadoDTO): Promise<EmpleadoEntity> {
        try {
            return await this.dataSource.transaction(async manager => {
                const tipoEmpleado = await this.tipoEmpleadoService.findOne(dto.idTipoEmpleado);
                const especialidad = dto.idEspecialidad ? await this.especialidadService.findOne(dto.idEspecialidad) : null;
                const persona = await this.personaService.create(dto, manager);
                const user = await this.userService.register(dto.email, dto.password, manager);


                const newEmpleado = this.empleadoRepository.create({
                    tipoEmpleado,
                    ...(especialidad ? { especialidad } : {}),
                    persona,
                    user
                });

                return manager.getRepository(EmpleadoEntity).save(newEmpleado);
            })


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
        return this.empleadoRepository.find({relations: ['tipoEmpleado','especialidad','persona','user']});
    }

    async findOne(id: number): Promise<EmpleadoEntity> {
        const empleado = await this.empleadoRepository.findOne({where: {id}, relations: ['tipoEmpleado','especialidad','persona','user']});
        if (!empleado) {
            throw new NotFoundException(`El id: ${id} no corresponde a ningun empleado`);
        }
        return empleado;
    }

    async findByUser(user: UserEntity): Promise<EmpleadoEntity> {
        const empleado = await this.empleadoRepository.findOne({where: {user}, relations: ['tipoEmpleado','especialidad','persona']});
        if (!empleado) {
            throw new NotFoundException(`El usuario: ${user.email} no corresponde a ningun empleado`);
        }
        return empleado;
    }

    async findAllDoctors(): Promise<EmpleadoEntity[]> {
        return this.empleadoRepository.find({where: {tipoEmpleado: {nombre: 'Doctor'}}, relations: ['tipoEmpleado','especialidad','persona']});
    }

    async assignEspecialidad(id: number, idEspecialidad: number): Promise<EmpleadoEntity> {
        const empleado = await this.findOne(id);

        if (empleado.tipoEmpleado.nombre !== 'Doctor') { throw new BadRequestException('El empleado ingresado no es un doctor'); }

        empleado.especialidad = await this.especialidadService.findOne(idEspecialidad);
        return this.empleadoRepository.save(empleado);
    }

   // async assignConsultorio()
}
