import { Test, TestingModule } from '@nestjs/testing';
import { PacienteController } from './paciente.controller';
import { PacienteService } from './paciente.service';
import { PacienteEntity } from 'src/entities/paciente.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';

describe('PacienteController', () => {
  let controller: PacienteController;
  let service: jest.Mocked<PacienteService>;

  const mockService = () => ({
    create: jest.fn(),
    edit: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacienteController],
      providers: [
        {
          provide: PacienteService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(PacienteController);
    service = module.get(PacienteService);
  });

  it('should create a patient', async () => {
    const dto = { email: 'patient@test.com' } as any;
    const expected = { id: 1 } as PacienteEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should edit a patient', async () => {
    const dto = { telefono: '123' } as any;
    const expected = { id: 2 } as PacienteEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(dto, 2)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(2, dto);
  });

  it('should list all patients', async () => {
    const expected = [{ id: 1 }] as PacienteEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should get a patient by id', async () => {
    const expected = { id: 4 } as PacienteEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(4)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(4);
  });
});
