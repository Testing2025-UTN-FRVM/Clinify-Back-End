import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { EmpleadoService } from './empleado.service';
import { EmpleadoEntity } from '../../entities/empleado.entity';
import { TipoEmpleadoService } from '../tipo-empleado/tipo-empleado.service';
import { UsersService } from '../users/users.service';
import { EspecialidadService } from '../especialidad/especialidad.service';
import { PersonaService } from '../persona/persona.service';
import { ConsultorioService } from '../consultorio/consultorio.service';
import { ProcedimientoService } from '../procedimiento/procedimiento.service';

const createDataSource = () => ({
  transaction: jest.fn(),
});

describe('EmpleadoService', () => {
  const repository = createMockRepository<EmpleadoEntity>();
  const tipoEmpleadoService = { findOne: jest.fn() } as unknown as TipoEmpleadoService;
  const userService = { register: jest.fn() } as unknown as UsersService;
  const especialidadService = { findOne: jest.fn() } as unknown as EspecialidadService;
  const personaService = { create: jest.fn() } as unknown as PersonaService;
  const consultorioService = { findOne: jest.fn() } as unknown as ConsultorioService;
  const procedimientoService = { findOne: jest.fn() } as unknown as ProcedimientoService;
  const dataSource = createDataSource() as any;
  let service: EmpleadoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmpleadoService(
      tipoEmpleadoService,
      userService,
      especialidadService,
      personaService,
      consultorioService,
      procedimientoService,
      repository as any,
      dataSource,
    );
  });

  it('creates an employee inside a transaction', async () => {
    const dto = {
      idTipoEmpleado: 1,
      idEspecialidad: 2,
      idConsultorio: 3,
      email: 'user@example.com',
      password: 'secret',
    } as any;
    const tipoEmpleado = { id: 1, nombre: 'Doctor' } as any;
    const especialidad = { id: 2 } as any;
    const consultorio = { id: 3 } as any;
    const persona = { id: 4 } as any;
    const user = { id: 5 } as any;
    const empleado = { id: 6 } as EmpleadoEntity;
    const managerRepository = { save: jest.fn().mockResolvedValue(empleado) };
    dataSource.transaction.mockImplementation(async (cb: any) => cb({ getRepository: () => managerRepository }));
    tipoEmpleadoService.findOne = jest.fn().mockResolvedValue(tipoEmpleado);
    especialidadService.findOne = jest.fn().mockResolvedValue(especialidad);
    consultorioService.findOne = jest.fn().mockResolvedValue(consultorio);
    personaService.create = jest.fn().mockResolvedValue(persona);
    userService.register = jest.fn().mockResolvedValue(user);
    repository.create!.mockReturnValue(empleado);

    const result = await service.create(dto);

    expect(tipoEmpleadoService.findOne).toHaveBeenCalledWith(dto.idTipoEmpleado);
    expect(especialidadService.findOne).toHaveBeenCalledWith(dto.idEspecialidad);
    expect(consultorioService.findOne).toHaveBeenCalledWith(dto.idConsultorio);
    expect(personaService.create).toHaveBeenCalled();
    expect(userService.register).toHaveBeenCalledWith(dto.email, dto.password, expect.anything());
    expect(repository.create).toHaveBeenCalledWith({
      tipoEmpleado,
      especialidad,
      consultorio,
      persona,
      user,
    });
    expect(managerRepository.save).toHaveBeenCalledWith(empleado);
    expect(result).toBe(empleado);
  });

  it('finds employee by id', async () => {
    const empleado = { id: 1 } as EmpleadoEntity;
    repository.findOneBy!.mockResolvedValue(empleado);

    const result = await service.findById(1);

    expect(result).toBe(empleado);
  });

  it('throws when employee by id not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });

  it('finds all employees with relations', async () => {
    const employees = [{ id: 1 } as EmpleadoEntity];
    repository.find!.mockResolvedValue(employees);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      relations: ['tipoEmpleado', 'especialidad', 'persona', 'user'],
    });
    expect(result).toBe(employees);
  });

  it('finds one employee by id with relations', async () => {
    const empleado = { id: 1 } as EmpleadoEntity;
    repository.findOne!.mockResolvedValue(empleado);

    const result = await service.findOne(1);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['tipoEmpleado', 'especialidad', 'persona', 'user'],
    });
    expect(result).toBe(empleado);
  });

  it('throws when employee not found by id', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow('El id: 1 no corresponde a ningun empleado');
  });

  it('finds employee by user', async () => {
    const empleado = { id: 1 } as EmpleadoEntity;
    const user = { email: 'user@example.com' } as any;
    repository.findOne!.mockResolvedValue(empleado);

    const result = await service.findByUser(user);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { user },
      relations: ['tipoEmpleado', 'especialidad', 'persona'],
    });
    expect(result).toBe(empleado);
  });

  it('throws when employee not found by user', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.findByUser({ email: 'missing@example.com' } as any)).rejects.toThrow('El usuario: missing@example.com no corresponde a ningun empleado');
  });

  it('finds all doctors', async () => {
    repository.find!.mockResolvedValue([]);

    await service.findAllDoctors();

    expect(repository.find).toHaveBeenCalledWith({
      where: { tipoEmpleado: { nombre: 'Doctor' } },
      relations: ['tipoEmpleado', 'especialidad', 'persona'],
    });
  });

  it('changes employee type', async () => {
    const empleado = { id: 1, tipoEmpleado: { id: 1 } } as EmpleadoEntity;
    repository.findOne!.mockResolvedValue(empleado);
    tipoEmpleadoService.findOne = jest.fn().mockResolvedValue({ id: 2 });
    repository.save!.mockResolvedValue({ ...empleado, tipoEmpleado: { id: 2 } });

    const result = await service.changeTipoEmpleado(1, 2);

    expect(tipoEmpleadoService.findOne).toHaveBeenCalledWith(2);
    expect(repository.save).toHaveBeenCalledWith(empleado);
    expect(result.tipoEmpleado).toEqual({ id: 2 });
  });

  it('assigns especialidad to doctor', async () => {
    const especialidad = { id: 2 } as any;
    const empleado = { id: 1, tipoEmpleado: { nombre: 'Doctor' } } as EmpleadoEntity;
    repository.findOne!.mockResolvedValue(empleado);
    especialidadService.findOne = jest.fn().mockResolvedValue(especialidad);
    repository.save!.mockResolvedValue({ ...empleado, especialidad });

    const result = await service.assignEspecialidad(1, 2);

    expect(especialidadService.findOne).toHaveBeenCalledWith(2);
    expect(repository.save).toHaveBeenCalledWith(empleado);
    expect(result.especialidad).toBe(especialidad);
  });

  it('throws when assigning especialidad to non doctor', async () => {
    const empleado = { id: 1, tipoEmpleado: { nombre: 'Recepcionista' } } as EmpleadoEntity;
    repository.findOne!.mockResolvedValue(empleado);

    await expect(service.assignEspecialidad(1, 2)).rejects.toThrow(BadRequestException);
  });

  it('assigns procedimientos', async () => {
    const procedimientos = [{ id: 1 } as any, { id: 2 } as any];
    const empleado = { id: 1, procedimientos: [] } as EmpleadoEntity;
    repository.findOne!.mockResolvedValue(empleado);
    procedimientoService.findOne = jest.fn().mockResolvedValueOnce(procedimientos[0]).mockResolvedValueOnce(procedimientos[1]);
    repository.save!.mockResolvedValue({ ...empleado, procedimientos });

    const result = await service.assignProcedimiento(1, { procedimientosIds: [1, 2] } as any);

    expect(procedimientoService.findOne).toHaveBeenCalledTimes(2);
    expect(repository.save).toHaveBeenCalledWith(empleado);
    expect(result.procedimientos).toEqual(procedimientos);
  });

  it('assigns consultorio to doctor', async () => {
    const consultorio = { id: 1 } as any;
    const empleado = { id: 1, tipoEmpleado: { nombre: 'Doctor' } } as EmpleadoEntity;
    repository.findOne!.mockResolvedValue(empleado);
    consultorioService.findOne = jest.fn().mockResolvedValue(consultorio);
    repository.save!.mockResolvedValue({ ...empleado, consultorio });

    const result = await service.assignConsultorio(1, 1);

    expect(consultorioService.findOne).toHaveBeenCalledWith(1);
    expect(repository.save).toHaveBeenCalledWith(empleado);
    expect(result.consultorio).toBe(consultorio);
  });

  it('throws when assigning consultorio to non doctor', async () => {
    const empleado = { id: 1, tipoEmpleado: { nombre: 'Recepcionista' } } as EmpleadoEntity;
    repository.findOne!.mockResolvedValue(empleado);

    await expect(service.assignConsultorio(1, 1)).rejects.toThrow(BadRequestException);
  });
});
