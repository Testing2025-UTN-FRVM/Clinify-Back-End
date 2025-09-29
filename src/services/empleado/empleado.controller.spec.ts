import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EmpleadoController } from './empleado.controller';
import { EmpleadoService } from './empleado.service';
import { EmpleadoEntity } from 'src/entities/empleado.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import {
  AssignProcedimientosDTO,
  PatchConsultorioDTO,
  PatchEspecialidadDTO,
  PatchTipoEmpleadoDTO,
} from 'src/interfaces/patch/patch-empleado.dto';

const mockEmpleado = () => ({ id: 1 }) as EmpleadoEntity;

describe('EmpleadoController', () => {
  let controller: EmpleadoController;
  let service: jest.Mocked<EmpleadoService>;

  const createServiceMock = () => ({
    create: jest.fn(),
    findByUser: jest.fn(),
    findAll: jest.fn(),
    findAllDoctors: jest.fn(),
    findOne: jest.fn(),
    changeTipoEmpleado: jest.fn(),
    assignEspecialidad: jest.fn(),
    assignProcedimiento: jest.fn(),
    assignConsultorio: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpleadoController],
      providers: [
        {
          provide: EmpleadoService,
          useValue: createServiceMock(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(EmpleadoController);
    service = module.get(EmpleadoService);
  });

  it('should create an employee', async () => {
    const dto = { email: 'test@email.com' } as any;
    const expected = mockEmpleado();
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should bubble up creation errors', async () => {
    const dto = { email: 'test@email.com' } as any;
    const error = new NotFoundException('persona not found');
    service.create.mockRejectedValue(error);

    await expect(controller.create(dto)).rejects.toBe(error);
  });

  it('should return logged employee info', async () => {
    const req = { user: { id: 9 } } as any;
    const expected = mockEmpleado();
    service.findByUser.mockResolvedValue(expected);

    await expect(controller.me(req)).resolves.toBe(expected);
    expect(service.findByUser).toHaveBeenCalledWith(req.user);
  });

  it('should bubble up errors when fetching logged employee', async () => {
    const req = { user: { id: 9 } } as any;
    const error = new NotFoundException('empleado not found');
    service.findByUser.mockRejectedValue(error);

    await expect(controller.me(req)).rejects.toBe(error);
  });

  it('should list all employees', async () => {
    const expected = [mockEmpleado()];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should list all doctors', async () => {
    const expected = [mockEmpleado()];
    service.findAllDoctors.mockResolvedValue(expected);

    await expect(controller.findAllDoctors()).resolves.toBe(expected);
    expect(service.findAllDoctors).toHaveBeenCalledTimes(1);
  });

  it('should fetch one employee', async () => {
    const expected = mockEmpleado();
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(4)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(4);
  });

  it('should bubble up errors when fetching one employee', async () => {
    const error = new NotFoundException('empleado not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(4)).rejects.toBe(error);
  });

  it('should change employee type', async () => {
    const expected = mockEmpleado();
    service.changeTipoEmpleado.mockResolvedValue(expected);

    await expect(controller.changeTipoEmpleado(5, { idTipoEmpleado: 2 } as any)).resolves.toBe(expected);
    expect(service.changeTipoEmpleado).toHaveBeenCalledWith(5, 2);
  });

  it('should bubble up errors when changing employee type', async () => {
    const error = new NotFoundException('tipo empleado not found');
    service.changeTipoEmpleado.mockRejectedValue(error);

    await expect(controller.changeTipoEmpleado(5, { idTipoEmpleado: 2 } as any)).rejects.toBe(error);
  });

  it('should assign especialidad', async () => {
    const expected = mockEmpleado();
    service.assignEspecialidad.mockResolvedValue(expected);

    await expect(controller.changeEspecialidad(3, { idEspecialidad: 7 } as any)).resolves.toBe(expected);
    expect(service.assignEspecialidad).toHaveBeenCalledWith(3, 7);
  });

  it('should bubble up errors when assigning especialidad', async () => {
    const error = new NotFoundException('especialidad not found');
    service.assignEspecialidad.mockRejectedValue(error);

    await expect(controller.changeEspecialidad(3, { idEspecialidad: 7 } as any)).rejects.toBe(error);
  });

  it('should assign procedimientos', async () => {
    const expected = mockEmpleado();
    const dto = { procedimientosIds: [1, 2] } as any;
    service.assignProcedimiento.mockResolvedValue(expected);

    await expect(controller.assignProcedimientos(8, dto)).resolves.toBe(expected);
    expect(service.assignProcedimiento).toHaveBeenCalledWith(8, dto);
  });

  it('should bubble up errors when assigning procedimientos', async () => {
    const dto = { procedimientosIds: [1, 2] } as any;
    const error = new NotFoundException('procedimiento not found');
    service.assignProcedimiento.mockRejectedValue(error);

    await expect(controller.assignProcedimientos(8, dto)).rejects.toBe(error);
  });

  it('should assign consultorio', async () => {
    const expected = mockEmpleado();
    service.assignConsultorio.mockResolvedValue(expected);

    await expect(controller.changeConsultorio(2, { idConsultorio: 4 } as any)).resolves.toBe(expected);
    expect(service.assignConsultorio).toHaveBeenCalledWith(2, 4);
  });

  it('should bubble up errors when assigning consultorio', async () => {
    const error = new NotFoundException('consultorio not found');
    service.assignConsultorio.mockRejectedValue(error);

    await expect(controller.changeConsultorio(2, { idConsultorio: 4 } as any)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty tipo empleado payload', async () => {
      const dto = plainToInstance(PatchTipoEmpleadoDTO, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('idTipoEmpleado');
    });

    it('should invalidate empty especialidad payload', async () => {
      const dto = plainToInstance(PatchEspecialidadDTO, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('idEspecialidad');
    });

    it('should invalidate empty consultorio payload', async () => {
      const dto = plainToInstance(PatchConsultorioDTO, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('idConsultorio');
    });

    it('should invalidate assign procedimientos payload without ids', async () => {
      const dto = plainToInstance(AssignProcedimientosDTO, {});
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
