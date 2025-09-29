import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ConsultorioController } from './consultorio.controller';
import { ConsultorioService } from './consultorio.service';
import { ConsultorioEntity } from 'src/entities/consultorio.entity';
import { CreateConsultorioDTO } from 'src/interfaces/create/create-consultorio.dto';
import { PatchConsultorioDTO } from 'src/interfaces/patch/patch-consultorio.dto';
import { AuthGuard } from 'src/middlewares/auth.middleware';

describe('ConsultorioController', () => {
  let controller: ConsultorioController;
  let service: jest.Mocked<ConsultorioService>;

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
      controllers: [ConsultorioController],
      providers: [
        {
          provide: ConsultorioService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get<ConsultorioController>(ConsultorioController);
    service = module.get(ConsultorioService);
  });

  it('should delegate creation to the service', async () => {
    const dto = { descripcion: 'A1' } as CreateConsultorioDTO;
    const expected = { id: 1 } as ConsultorioEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should bubble up creation errors', async () => {
    const dto = { descripcion: 'A1' } as CreateConsultorioDTO;
    const error = new NotFoundException('related entity missing');
    service.create.mockRejectedValue(error);

    await expect(controller.create(dto)).rejects.toBe(error);
  });

  it('should delegate edition to the service', async () => {
    const dto = { descripcion: 'Updated' } as PatchConsultorioDTO;
    const expected = { id: 1, descripcion: 'Updated' } as ConsultorioEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(dto, 1)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(1, dto);
  });

  it('should bubble up edition errors', async () => {
    const dto = { descripcion: 'Updated' } as PatchConsultorioDTO;
    const error = new NotFoundException('consultorio not found');
    service.edit.mockRejectedValue(error);

    await expect(controller.edit(dto, 1)).rejects.toBe(error);
  });

  it('should delegate deletion to the service', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(3)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(3);
  });

  it('should bubble up deletion errors', async () => {
    const error = new NotFoundException('consultorio not found');
    service.delete.mockRejectedValue(error);

    await expect(controller.delete(3)).rejects.toBe(error);
  });

  it('should return all consultorios from the service', async () => {
    const expected = [{ id: 1 }] as ConsultorioEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return one consultorio from the service', async () => {
    const expected = { id: 1 } as ConsultorioEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(4)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(4);
  });

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('consultorio not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(4)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateConsultorioDTO, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(2);
      expect(errors.map((err) => err.property).sort()).toEqual([
        'numero',
        'observaciones',
      ]);
    });

    it('should invalidate patch payload with wrong types', async () => {
      const dto = plainToInstance(PatchConsultorioDTO, { numero: 'bad' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('numero');
    });
  });
});
