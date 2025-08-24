import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EmpleadoEntity} from "../../entities/empleado.entity";
import {Repository} from "typeorm";
import {RegistrarEmpleadoDTO} from "../../interfaces/register.dto";
import {TipoEmpleadoService} from "../tipo-empleado/tipo-empleado.service";
import {UsersService} from "../users/users.service";
import {EspecialidadService} from "../especialidad/especialidad.service";

@Injectable()
export class EmpleadoService {
    constructor(
        private readonly tipoEmpleadoService: TipoEmpleadoService,
        private readonly userService: UsersService,
        private readonly especialidadService: EspecialidadService,

        @InjectRepository(EmpleadoEntity)
        private readonly empleadoRepository: Repository<EmpleadoEntity>,


    ) {}

    async create(dto: RegistrarEmpleadoDTO): Promise<EmpleadoEntity> {
        try {
            const tipo = await this.tipoEmpleadoService.findOne(dto.idTipoEmpleado);

            const user = await this.userService.register(dto.email, dto.password);

            if(tipo.nombre =="Doctor") {

                const especialidad = await this.especialidadService.findOne(dto.idEspecialidad);

                const empleado = this.empleadoRepository.create({
                    nombre: dto.nombre,
                    apellido: dto.apellido,
                    fechaNacimiento: dto.fechaNacimiento,
                    tipoDocumento: dto.tipoDocumento,
                    numeroDocumento: dto.nroDocumento,
                    telefono: dto.telefono,
                    user,
                    tipoEmpleado: tipo,
                    especialidad: especialidad,
                });
                return this.empleadoRepository.save(empleado);
            } else {
                const empleado = this.empleadoRepository.create({
                    nombre: dto.nombre,
                    apellido: dto.apellido,
                    fechaNacimiento: dto.fechaNacimiento,
                    tipoDocumento: dto.tipoDocumento,
                    numeroDocumento: dto.nroDocumento,
                    telefono: dto.telefono,
                    user,
                    tipoEmpleado: tipo
                });
                return this.empleadoRepository.save(empleado);
            }


        } catch (error) {
            throw new Error(error.message,error.stack);
        }
    }

    async findAll(): Promise<EmpleadoEntity[]> {
        return this.empleadoRepository.find({relations: ["tipoEmpleado", "user"]});
    }
}
