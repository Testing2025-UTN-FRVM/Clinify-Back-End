import { NotFoundException } from '@nestjs/common';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadEntity } from '../../entities/especialidad.entity';

describe('EspecialidadService', () => {
  let service: EspecialidadService;
  let repo: any;

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
    };
    service = new EspecialidadService(repo as any);
  });

  it('findAll should return all especialidades', async () => {
    const especialidades = [
      { id: 1, nombre: 'Cardiología' },
      { id: 2, nombre: 'Pediatría' },
    ] as EspecialidadEntity[];
    repo.find.mockResolvedValue(especialidades);

    const result = await service.findAll();
    expect(result).toEqual(especialidades);
    expect(repo.find).toHaveBeenCalled();
  });

  it('findOne should return especialidad if found', async () => {
    const especialidad = { id: 1, nombre: 'Cardiología' } as EspecialidadEntity;
    repo.findOneBy.mockResolvedValue(especialidad);

    const result = await service.findOne(1);
    expect(result).toEqual(especialidad);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('findOne should throw NotFoundException if not found', async () => {
    repo.findOneBy.mockResolvedValue(undefined);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
