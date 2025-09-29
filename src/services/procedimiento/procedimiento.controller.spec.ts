import { Test, TestingModule } from '@nestjs/testing';
import { ProcedimientoController } from './procedimiento.controller';
import { ProcedimientoService } from './procedimiento.service';
import { ProcedimientoEntity } from 'src/entities/procedimiento.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';

describe('ProcedimientoController', () => {
  let controller: ProcedimientoController;
  let service: jest.Mocked<ProcedimientoService>;

  const mockService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcedimientoController],
      providers: [
        {
          provide: ProcedimientoService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(ProcedimientoController);
    service = module.get(ProcedimientoService);
  });

  it('should create a procedure', async () => {
    const dto = { descripcion: 'Eco' } as any;
    const expected = { id: 1 } as ProcedimientoEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.createProcedimiento(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should list procedures', async () => {
    const expected = [{ id: 1 }] as ProcedimientoEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should get one procedure', async () => {
    const expected = { id: 5 } as ProcedimientoEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(5)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('should patch a procedure', async () => {
    const dto = { descripcion: 'Updated' } as any;
    const expected = { id: 3 } as ProcedimientoEntity;
    service.patch.mockResolvedValue(expected);

    await expect(controller.patch(3, dto)).resolves.toBe(expected);
    expect(service.patch).toHaveBeenCalledWith(3, dto);
  });

  it('should delete a procedure', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(6)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(6);
  });
});
