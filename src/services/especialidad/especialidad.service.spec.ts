import { NotFoundException } from '@nestjs/common';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadEntity } from '../../entities/especialidad.entity';

describe('EspecialidadService', () => {
  const repository = createMockRepository<EspecialidadEntity>();
  let service: EspecialidadService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EspecialidadService(repository as any);
  });

  it('creates a specialty', async () => {
    const dto = { nombre: 'Cardiología' } as any;
    const entity = { id: 1, ...dto } as EspecialidadEntity;
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('updates a specialty', async () => {
    const entity = { id: 1, nombre: 'Cardiología' } as EspecialidadEntity;
    const dto = { nombre: 'Pediatría' } as any;
    repository.findOneBy!.mockResolvedValue(entity);
    repository.save!.mockResolvedValue({ ...entity, ...dto });

    const result = await service.edit(entity.id, dto);

    expect(repository.merge).toHaveBeenCalledWith(entity, dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual({ ...entity, ...dto });
  });

  it('deletes a specialty', async () => {
    const entity = { id: 1, nombre: 'Cardiología' } as EspecialidadEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.delete(entity.id);

    expect(repository.remove).toHaveBeenCalledWith(entity);
    expect(result.message).toContain(entity.nombre);
  });

  it('returns all specialties', async () => {
    const entities = [{ id: 1 } as EspecialidadEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findAll();

    expect(result).toBe(entities);
  });

  it('finds a specialty by id', async () => {
    const entity = { id: 1 } as EspecialidadEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.findOne(1);

    expect(result).toBe(entity);
  });

  it('throws when specialty not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
