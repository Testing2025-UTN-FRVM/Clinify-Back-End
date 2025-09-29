import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GrupoSanguineoController } from './grupo-sanguineo.controller';
import { GrupoSanguineoService } from './grupo-sanguineo.service';
import { GrupoSanguineoEntity } from 'src/entities/grupoSanguineo.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateGrupoSanguineoDTO } from 'src/interfaces/create/create-grupoSanguineo.dto';

describe('GrupoSanguineoController', () => {
  let controller: GrupoSanguineoController;
  let service: jest.Mocked<GrupoSanguineoService>;

  const mockService = () => ({
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrupoSanguineoController],
      providers: [
        {
          provide: GrupoSanguineoService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(GrupoSanguineoController);
    service = module.get(GrupoSanguineoService);
  });

  it('should create a blood group', async () => {
    const dto = { descripcion: 'O+' } as any;
    const expected = { id: 1 } as GrupoSanguineoEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should bubble up creation errors', async () => {
    const dto = { descripcion: 'O+' } as any;
    const error = new NotFoundException('grupo sanguineo conflict');
    service.create.mockRejectedValue(error);

    await expect(controller.create(dto)).rejects.toBe(error);
  });

  it('should delete a blood group', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(3)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(3);
  });

  it('should bubble up deletion errors', async () => {
    const error = new NotFoundException('grupo sanguineo not found');
    service.delete.mockRejectedValue(error);

    await expect(controller.delete(3)).rejects.toBe(error);
  });

  it('should list blood groups', async () => {
    const expected = [{ id: 1 }] as GrupoSanguineoEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should find a blood group by id', async () => {
    const expected = { id: 2 } as GrupoSanguineoEntity;
    service.findById.mockResolvedValue(expected);

    await expect(controller.findOne(2)).resolves.toBe(expected);
    expect(service.findById).toHaveBeenCalledWith(2);
  });

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('grupo sanguineo not found');
    service.findById.mockRejectedValue(error);

    await expect(controller.findOne(2)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateGrupoSanguineoDTO, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nombre');
    });
  });
});
