import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TipoEmpleadoController } from './tipo-empleado.controller';
import { TipoEmpleadoService } from './tipo-empleado.service';
import { TipoEmpleadoEntity } from 'src/entities/tipoEmpleado.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateTipoEmpleadoDTO } from 'src/interfaces/create/create-tipoEmpleado.dto';

describe('TipoEmpleadoController', () => {
  let controller: TipoEmpleadoController;
  let service: jest.Mocked<TipoEmpleadoService>;

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
      controllers: [TipoEmpleadoController],
      providers: [
        {
          provide: TipoEmpleadoService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(TipoEmpleadoController);
    service = module.get(TipoEmpleadoService);
  });

  it('should create an employee type', async () => {
    const dto = { nombre: 'Doctor' } as any;
    const expected = { id: 1 } as TipoEmpleadoEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should bubble up creation errors', async () => {
    const dto = { nombre: 'Doctor' } as any;
    const error = new NotFoundException('tipo empleado conflict');
    service.create.mockRejectedValue(error);

    await expect(controller.create(dto)).rejects.toBe(error);
  });

  it('should edit an employee type', async () => {
    const dto = { nombre: 'Nurse' } as any;
    const expected = { id: 2 } as TipoEmpleadoEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(dto, 2)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(2, dto);
  });

  it('should bubble up edition errors', async () => {
    const dto = { nombre: 'Nurse' } as any;
    const error = new NotFoundException('tipo empleado not found');
    service.edit.mockRejectedValue(error);

    await expect(controller.edit(dto, 2)).rejects.toBe(error);
  });

  it('should delete an employee type', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(3)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(3);
  });

  it('should bubble up deletion errors', async () => {
    const error = new NotFoundException('tipo empleado not found');
    service.delete.mockRejectedValue(error);

    await expect(controller.delete(3)).rejects.toBe(error);
  });

  it('should list employee types', async () => {
    const expected = [{ id: 1 }] as TipoEmpleadoEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should find an employee type', async () => {
    const expected = { id: 5 } as TipoEmpleadoEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(5)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('tipo empleado not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(5)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateTipoEmpleadoDTO, {});
      const errors = await validate(dto);

      expect(errors.map((err) => err.property).sort()).toEqual([
        'descripcion',
        'nombre',
      ]);
    });
  });
});
