import { createMockRepository } from '../../../test/utils/mock-repository';
import { EstadoTurnoService } from './estado-turno.service';
import { EstadoTurnoEntity } from '../../entities/estadoTurno.entity';

describe('EstadoTurnoService', () => {
  const repository = createMockRepository<EstadoTurnoEntity>();
  let service: EstadoTurnoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EstadoTurnoService(repository as any);
  });

  it('creates a estado turno', async () => {
    const dto = { nombre: 'Pendiente' } as any;
    const entity = { id: 1, ...dto } as EstadoTurnoEntity;
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('edits a estado turno', async () => {
    const entity = { id: 1, nombre: 'Pendiente' } as EstadoTurnoEntity;
    const dto = { nombre: 'Confirmado' } as any;
    repository.findOneBy!.mockResolvedValue(entity);
    repository.save!.mockResolvedValue({ ...entity, ...dto });

    const result = await service.edit(entity.id, dto);

    expect(repository.merge).toHaveBeenCalledWith(entity, dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual({ ...entity, ...dto });
  });

  it('throws when editing non-existing estado turno', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.edit(999, { nombre: 'Confirmado' } as any)).rejects.toThrow(
      'No existe el estado de turno con el id: 999',
    );
  });

  it('deletes a estado turno', async () => {
    const entity = { id: 1, nombre: 'Pendiente' } as EstadoTurnoEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.delete(entity.id);

    expect(repository.remove).toHaveBeenCalledWith(entity);
    expect(result.message).toContain(entity.nombre);
  });

  it('throws when deleting non-existing estado turno', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.delete(999)).rejects.toThrow('No existe el estado de turno con el id: 999');
  });

  it('finds all estados', async () => {
    const entities = [{ id: 1 } as EstadoTurnoEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findAll();

    expect(result).toBe(entities);
  });

  it('finds by id', async () => {
    const entity = { id: 1 } as EstadoTurnoEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.findOne(1);

    expect(result).toBe(entity);
  });

  it('throws when not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow('No existe el estado de turno con el id: 1');
  });
});
