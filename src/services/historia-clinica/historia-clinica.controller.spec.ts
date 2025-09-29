import { Test, TestingModule } from '@nestjs/testing';
import { HistoriaClinicaController } from './historia-clinica.controller';
import { HistoriaClinicaService } from './historia-clinica.service';
import { HistoriaClinicaEntity } from 'src/entities/historiaClinica.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';

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

  it('should edit a medical record with the request user', async () => {
    const req = { user: { id: 2 } } as any;
    const dto = { descripcion: 'Updated' } as any;
    const expected = { id: 3 } as HistoriaClinicaEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(req, dto, 3)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(3, dto, req.user);
  });

  it('should find a medical record by id', async () => {
    const expected = { id: 5 } as HistoriaClinicaEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(5)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('should find medical records by patient', async () => {
    const expected = [{ id: 1 }] as HistoriaClinicaEntity[];
    service.findByPatient.mockResolvedValue(expected);

    await expect(controller.findByPatient(9)).resolves.toBe(expected);
    expect(service.findByPatient).toHaveBeenCalledWith(9);
  });
});
