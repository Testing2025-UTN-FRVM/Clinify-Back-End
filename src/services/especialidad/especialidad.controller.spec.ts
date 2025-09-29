import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EspecialidadController } from './especialidad.controller';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadEntity } from 'src/entities/especialidad.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateEspecialidadDto } from 'src/interfaces/create/create-especialidad.dto';
import { PatchEspecialidad } from 'src/interfaces/patch/patch-especialidad.dto';

describe('EspecialidadController', () => {
  let controller: EspecialidadController;
  let service: jest.Mocked<EspecialidadService>;

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
      controllers: [EspecialidadController],
      providers: [
        {
          provide: EspecialidadService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(EspecialidadController);
    service = module.get(EspecialidadService);
  });

  it('should create a specialty', async () => {
    const dto = { descripcion: 'Trauma' } as any;
    const expected = { id: 1 } as EspecialidadEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should bubble up creation errors', async () => {
    const dto = { descripcion: 'Trauma' } as any;
    const error = new NotFoundException('especialidad exists');
    service.create.mockRejectedValue(error);

    await expect(controller.create(dto)).rejects.toBe(error);
  });

  it('should edit a specialty', async () => {
    const dto = { descripcion: 'Updated' } as any;
    const expected = { id: 2 } as EspecialidadEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(dto, 2)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(2, dto);
  });

  it('should bubble up edition errors', async () => {
    const dto = { descripcion: 'Updated' } as any;
    const error = new NotFoundException('especialidad not found');
    service.edit.mockRejectedValue(error);

    await expect(controller.edit(dto, 2)).rejects.toBe(error);
  });

  it('should delete a specialty', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(4)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(4);
  });

  it('should bubble up deletion errors', async () => {
    const error = new NotFoundException('especialidad not found');
    service.delete.mockRejectedValue(error);

    await expect(controller.delete(4)).rejects.toBe(error);
  });

  it('should list all specialties', async () => {
    const expected = [{ id: 1 }] as EspecialidadEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return a specialty', async () => {
    const expected = { id: 5 } as EspecialidadEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(5)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('especialidad not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(5)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateEspecialidadDto, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(2);
      expect(errors.map((err) => err.property).sort()).toEqual([
        'descripcion',
        'nombre',
      ]);
    });

    it('should allow patch payload to omit fields but validate types', async () => {
      const dto = plainToInstance(PatchEspecialidad, { nombre: 123 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nombre');
    });
  });
});
