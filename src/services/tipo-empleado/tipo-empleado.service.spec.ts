import { NotFoundException } from '@nestjs/common';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { TipoEmpleadoService } from './tipo-empleado.service';
import { TipoEmpleadoEntity } from '../../entities/tipoEmpleado.entity';

describe('TipoEmpleadoService', () => {
  const repository = createMockRepository<TipoEmpleadoEntity>();
  let service: TipoEmpleadoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TipoEmpleadoService(repository as any);
  });

  it('creates a tipo empleado', async () => {
    const dto = { nombre: 'Doctor' } as any;
    const entity = { id: 1, ...dto } as TipoEmpleadoEntity;
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('edits a tipo empleado', async () => {
    const entity = { id: 1, nombre: 'Doctor' } as TipoEmpleadoEntity;
    const dto = { nombre: 'Enfermero' } as any;
    repository.findOneBy!.mockResolvedValue(entity);
    repository.save!.mockResolvedValue({ ...entity, ...dto });

    const result = await service.edit(entity.id, dto);

    expect(repository.merge).toHaveBeenCalledWith(entity, dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual({ ...entity, ...dto });
  });

  it('throws when editing a non-existing tipo empleado', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.edit(999, { nombre: 'Enfermero' } as any)).rejects.toThrow(NotFoundException);
  });

  it('deletes a tipo empleado', async () => {
    const entity = { id: 1, nombre: 'Doctor' } as TipoEmpleadoEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.delete(entity.id);

    expect(repository.remove).toHaveBeenCalledWith(entity);
    expect(result.message).toContain(entity.nombre);
  });

  it('throws when deleting a non-existing tipo empleado', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.delete(999)).rejects.toThrow(NotFoundException);
  });

  it('returns all tipos de empleado', async () => {
    const entities = [{ id: 1 } as TipoEmpleadoEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findAll();

    expect(result).toBe(entities);
  });

  it('finds a tipo empleado by id', async () => {
    const entity = { id: 1 } as TipoEmpleadoEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.findOne(1);

    expect(result).toBe(entity);
  });

  it('throws when tipo empleado not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
