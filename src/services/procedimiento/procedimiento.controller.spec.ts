import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProcedimientoController } from './procedimiento.controller';
import { ProcedimientoService } from './procedimiento.service';
import { ProcedimientoEntity } from 'src/entities/procedimiento.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateProcedimientoDTO } from 'src/interfaces/create/create-procedimiento.dto';
import { PatchProcedimientoDTO } from 'src/interfaces/patch/patch-procedimiento.dto';

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

  it('should bubble up creation errors', async () => {
    const dto = { descripcion: 'Eco' } as any;
    const error = new NotFoundException('procedimiento conflict');
    service.create.mockRejectedValue(error);

    await expect(controller.createProcedimiento(dto)).rejects.toBe(error);
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

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('procedimiento not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(5)).rejects.toBe(error);
  });

  it('should patch a procedure', async () => {
    const dto = { descripcion: 'Updated' } as any;
    const expected = { id: 3 } as ProcedimientoEntity;
    service.patch.mockResolvedValue(expected);

    await expect(controller.patch(3, dto)).resolves.toBe(expected);
    expect(service.patch).toHaveBeenCalledWith(3, dto);
  });

  it('should bubble up patch errors', async () => {
    const dto = { descripcion: 'Updated' } as any;
    const error = new NotFoundException('procedimiento not found');
    service.patch.mockRejectedValue(error);

    await expect(controller.patch(3, dto)).rejects.toBe(error);
  });

  it('should delete a procedure', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(6)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(6);
  });

  it('should bubble up deletion errors', async () => {
    const error = new NotFoundException('procedimiento not found');
    service.delete.mockRejectedValue(error);

    await expect(controller.delete(6)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateProcedimientoDTO, {});
      const errors = await validate(dto);

      expect(errors.map((err) => err.property).sort()).toEqual([
        'descripcion',
        'duracion',
        'nombre',
      ]);
    });

    it('should validate patch payload types', async () => {
      const dto = plainToInstance(PatchProcedimientoDTO, { duracion: 'bad' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('duracion');
    });
  });
});
