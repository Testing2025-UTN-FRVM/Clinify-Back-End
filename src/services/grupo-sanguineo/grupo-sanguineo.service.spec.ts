import { NotFoundException } from '@nestjs/common';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { GrupoSanguineoService } from './grupo-sanguineo.service';
import { GrupoSanguineoEntity } from '../../entities/grupoSanguineo.entity';

describe('GrupoSanguineoService', () => {
  const repository = createMockRepository<GrupoSanguineoEntity>();
  let service: GrupoSanguineoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GrupoSanguineoService(repository as any);
  });

  it('creates a blood group', async () => {
    const dto = { nombre: 'O+' } as any;
    const entity = { id: 1, ...dto } as GrupoSanguineoEntity;
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('deletes a blood group', async () => {
    const entity = { id: 1, nombre: 'O+' } as GrupoSanguineoEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.delete(entity.id);

    expect(repository.remove).toHaveBeenCalledWith(entity);
    expect(result.message).toContain(entity.nombre);
  });

  it('throws when deleting a non-existing blood group', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.delete(999)).rejects.toThrow(NotFoundException);
  });

  it('returns all blood groups', async () => {
    const entities = [{ id: 1 } as GrupoSanguineoEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findAll();

    expect(result).toBe(entities);
  });

  it('finds a blood group by id', async () => {
    const entity = { id: 1 } as GrupoSanguineoEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.findById(1);

    expect(result).toBe(entity);
  });

  it('throws when blood group not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });
});
