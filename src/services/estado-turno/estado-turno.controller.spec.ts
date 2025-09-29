import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EstadoTurnoController } from './estado-turno.controller';
import { EstadoTurnoService } from './estado-turno.service';
import { EstadoTurnoEntity } from 'src/entities/estadoTurno.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateEstadoTurnoDTO } from 'src/interfaces/create/create-estadoTurno.dto';
import { PatchEstadoTurnoDTO } from 'src/interfaces/patch/patch-estadoTurno.dto';

describe('EstadoTurnoController', () => {
  let controller: EstadoTurnoController;
  let service: jest.Mocked<EstadoTurnoService>;

  const mockService = () => ({
    create: jest.fn(),
    edit: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoTurnoController],
      providers: [
        {
          provide: EstadoTurnoService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(EstadoTurnoController);
    service = module.get(EstadoTurnoService);
  });

  it('should create an estado turno', async () => {
    const dto = { descripcion: 'Nuevo' } as any;
    const expected = { id: 1 } as EstadoTurnoEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should bubble up creation errors', async () => {
    const dto = { descripcion: 'Nuevo' } as any;
    const error = new NotFoundException('estado-turno conflict');
    service.create.mockRejectedValue(error);

    await expect(controller.create(dto)).rejects.toBe(error);
  });

  it('should edit an estado turno', async () => {
    const dto = { descripcion: 'Actualizado' } as any;
    const expected = { id: 2 } as EstadoTurnoEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(2, dto)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(2, dto);
  });

  it('should bubble up edition errors', async () => {
    const dto = { descripcion: 'Actualizado' } as any;
    const error = new NotFoundException('estado-turno not found');
    service.edit.mockRejectedValue(error);

    await expect(controller.edit(2, dto)).rejects.toBe(error);
  });

  it('should delete an estado turno', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(5)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(5);
  });

  it('should bubble up deletion errors', async () => {
    const error = new NotFoundException('estado-turno not found');
    service.delete.mockRejectedValue(error);

    await expect(controller.delete(5)).rejects.toBe(error);
  });

  it('should list all estados turno', async () => {
    const expected = [{ id: 1 }] as EstadoTurnoEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return one estado turno', async () => {
    const expected = { id: 3 } as EstadoTurnoEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(3)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(3);
  });

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('estado-turno not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(3)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateEstadoTurnoDTO, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(2);
      expect(errors.map((err) => err.property).sort()).toEqual([
        'descripcion',
        'nombre',
      ]);
    });

    it('should validate patch payload types', async () => {
      const dto = plainToInstance(PatchEstadoTurnoDTO, { nombre: 123 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nombre');
    });
  });
});
