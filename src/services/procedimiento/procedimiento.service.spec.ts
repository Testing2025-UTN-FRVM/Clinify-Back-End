import { NotFoundException } from '@nestjs/common';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { ProcedimientoService } from './procedimiento.service';
import { ProcedimientoEntity } from '../../entities/procedimiento.entity';

describe('ProcedimientoService', () => {
  const repository = createMockRepository<ProcedimientoEntity>();
  let service: ProcedimientoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProcedimientoService(repository as any);
  });

  it('creates a procedure', async () => {
    const dto = { nombre: 'Consulta', duracion: 30 } as any;
    const entity = { id: 1, ...dto } as ProcedimientoEntity;
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('patches a procedure', async () => {
    const entity = { id: 1, nombre: 'Consulta', duracion: 30 } as ProcedimientoEntity;
    const dto = { duracion: 45 } as any;
    repository.findOneBy!.mockResolvedValue(entity);
    repository.merge!.mockReturnValue({ ...entity, ...dto });
    repository.save!.mockResolvedValue({ ...entity, ...dto });

    const result = await service.patch(entity.id, dto);

    expect(repository.merge).toHaveBeenCalledWith(entity, dto);
    expect(repository.save).toHaveBeenCalledWith({ ...entity, ...dto });
    expect(result).toEqual({ ...entity, ...dto });
  });

  it('deletes a procedure', async () => {
    const entity = { id: 1, nombre: 'Consulta' } as ProcedimientoEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.delete(entity.id);

    expect(repository.remove).toHaveBeenCalledWith(entity);
    expect(result.message).toContain(entity.nombre);
  });

  it('finds all procedures', async () => {
    const entities = [{ id: 1 } as ProcedimientoEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findAll();

    expect(result).toBe(entities);
  });

  it('finds one procedure', async () => {
    const entity = { id: 1 } as ProcedimientoEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.findOne(1);

    expect(result).toBe(entity);
  });

  it('throws when procedure not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
