import { createMockRepository } from '../../../test/utils/mock-repository';
import { PermissionsService } from './permissions.service';
import { PermissionEntity } from '../../entities/permission.entity';

describe('PermissionsService', () => {
  const repository = createMockRepository<PermissionEntity>();
  let service: PermissionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PermissionsService(repository as any);
  });

  it('creates a permission', async () => {
    const dto = { code: 'user:create', description: 'Create user' } as any;
    const entity = { id: 1, ...dto } as PermissionEntity;
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('updates a permission', async () => {
    const entity = { id: 1, code: 'user:create' } as PermissionEntity;
    const dto = { code: 'user:update' } as any;
    repository.findOneBy!.mockResolvedValue(entity);
    repository.save!.mockResolvedValue({ ...entity, ...dto });

    const result = await service.update(entity.id, dto);

    expect(repository.merge).toHaveBeenCalledWith(entity, dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual({ ...entity, ...dto });
  });

  it('throws when updating a non-existing permission', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.update(999, { code: 'user:update' } as any)).rejects.toThrow(
      'No existe el permiso con el id: 999',
    );
  });

  it('deletes a permission', async () => {
    const entity = { id: 1, code: 'user:create' } as PermissionEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.delete(entity.id);

    expect(repository.remove).toHaveBeenCalledWith(entity);
    expect(result.message).toContain(entity.code);
  });

  it('throws when deleting a non-existing permission', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.delete(999)).rejects.toThrow('No existe el permiso con el id: 999');
  });

  it('finds a permission by id', async () => {
    const entity = { id: 1 } as PermissionEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.findOne(1);

    expect(result).toBe(entity);
  });

  it('throws when permission not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow('No existe el permiso con el id: 1');
  });

  it('returns all permissions', async () => {
    const entities = [{ id: 1 } as PermissionEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findAll();

    expect(result).toBe(entities);
  });
});
