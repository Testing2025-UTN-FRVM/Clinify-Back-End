import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HistoriaClinicaController } from './historia-clinica.controller';
import { HistoriaClinicaService } from './historia-clinica.service';
import { HistoriaClinicaEntity } from 'src/entities/historiaClinica.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateHistoriaClinicaDTO } from 'src/interfaces/create/create-historiaClinica.dto';
import { PatchHistoriaClinicaDTO } from 'src/interfaces/patch/patch-historiaClinica.dto';

describe('HistoriaClinicaController', () => {
  let controller: HistoriaClinicaController;
  let service: jest.Mocked<HistoriaClinicaService>;

  const mockService = () => ({
    create: jest.fn(),
    edit: jest.fn(),
    findOne: jest.fn(),
    findByPatient: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoriaClinicaController],
      providers: [
        {
          provide: HistoriaClinicaService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(HistoriaClinicaController);
    service = module.get(HistoriaClinicaService);
  });

  it('should create a medical record with the request user', async () => {
    const req = { user: { id: 7 } } as any;
    const dto = { descripcion: 'Test' } as any;
    const expected = { id: 1 } as HistoriaClinicaEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(req, dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto, req.user);
  });

  it('should bubble up creation errors', async () => {
    const req = { user: { id: 7 } } as any;
    const dto = { descripcion: 'Test' } as any;
    const error = new NotFoundException('paciente not found');
    service.create.mockRejectedValue(error);

    await expect(controller.create(req, dto)).rejects.toBe(error);
  });

  it('should edit a medical record with the request user', async () => {
    const req = { user: { id: 2 } } as any;
    const dto = { descripcion: 'Updated' } as any;
    const expected = { id: 3 } as HistoriaClinicaEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(req, dto, 3)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(3, dto, req.user);
  });

  it('should bubble up edition errors', async () => {
    const req = { user: { id: 2 } } as any;
    const dto = { descripcion: 'Updated' } as any;
    const error = new NotFoundException('historia not found');
    service.edit.mockRejectedValue(error);

    await expect(controller.edit(req, dto, 3)).rejects.toBe(error);
  });

  it('should find a medical record by id', async () => {
    const expected = { id: 5 } as HistoriaClinicaEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(5)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('historia not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(5)).rejects.toBe(error);
  });

  it('should find medical records by patient', async () => {
    const expected = [{ id: 1 }] as HistoriaClinicaEntity[];
    service.findByPatient.mockResolvedValue(expected);

    await expect(controller.findByPatient(9)).resolves.toBe(expected);
    expect(service.findByPatient).toHaveBeenCalledWith(9);
  });

  it('should bubble up errors when searching by patient', async () => {
    const error = new NotFoundException('historia not found');
    service.findByPatient.mockRejectedValue(error);

    await expect(controller.findByPatient(9)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateHistoriaClinicaDTO, {});
      const errors = await validate(dto);

      expect(errors.map((err) => err.property).sort()).toEqual([
        'entrada',
        'paciente',
      ]);
    });

    it('should validate optional patch fields types', async () => {
      const dto = plainToInstance(PatchHistoriaClinicaDTO, { entrada: 123 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('entrada');
    });
  });
});
