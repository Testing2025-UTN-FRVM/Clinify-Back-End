import { Test, TestingModule } from '@nestjs/testing';
import { EspecialidadController } from './especialidad.controller';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadEntity } from 'src/entities/especialidad.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';

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

  it('should edit a specialty', async () => {
    const dto = { descripcion: 'Updated' } as any;
    const expected = { id: 2 } as EspecialidadEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(dto, 2)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(2, dto);
  });

  it('should delete a specialty', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(4)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(4);
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
});
