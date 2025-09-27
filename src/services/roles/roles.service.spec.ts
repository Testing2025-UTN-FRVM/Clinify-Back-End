import { createMockRepository } from '../../../test/utils/mock-repository';
import { RolesService } from './roles.service';
import { RoleEntity } from '../../entities/role.entity';
import { PermissionsService } from '../permissions/permissions.service';

describe('RolesService', () => {
  const repository = createMockRepository<RoleEntity>();
  const permissionsService = {
    findOne: jest.fn(),
  } as unknown as PermissionsService;
  let service: RolesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RolesService(repository as any, permissionsService);
  });

  it('creates a role', async () => {
    const dto = { name: 'Admin' } as any;
    const entity = { id: 1, ...dto } as RoleEntity;
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('updates a role', async () => {
    const entity = { id: 1, name: 'User' } as RoleEntity;
    const dto = { name: 'Admin' } as any;
    repository.findOneBy!.mockResolvedValue(entity);
    repository.save!.mockResolvedValue({ ...entity, ...dto });

    const result = await service.update(entity.id, dto);

    expect(repository.merge).toHaveBeenCalledWith(entity, dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual({ ...entity, ...dto });
  });

  it('deletes a role', async () => {
    const entity = { id: 1, name: 'User' } as RoleEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.delete(entity.id);

    expect(repository.remove).toHaveBeenCalledWith(entity);
    expect(result.message).toContain(entity.name);
  });

  it('returns all roles', async () => {
    const entities = [{ id: 1 } as RoleEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findAll();

    expect(result).toBe(entities);
  });

  it('finds a role by id', async () => {
    const entity = { id: 1 } as RoleEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.findOne(1);

    expect(result).toBe(entity);
  });

  it('assigns permissions to a role', async () => {
    const permission = { id: 1 } as any;
    const role = { id: 1, permissions: [] } as RoleEntity;
    repository.findOneBy!.mockResolvedValue(role);
    permissionsService.findOne = jest.fn().mockResolvedValue(permission);
    repository.save!.mockResolvedValue({ ...role, permissions: [permission] });

    const result = await service.assignPermissions(1, { permissionCodes: [1] } as any);

    expect(permissionsService.findOne).toHaveBeenCalledWith(1);
    expect(repository.save).toHaveBeenCalledWith(role);
    expect(role.permissions).toContain(permission);
    expect(result.permissions).toContain(permission);
  });

  it('removes a permission from a role', async () => {
    const permission = { id: 1 } as any;
    const role = { id: 1, permissions: [permission, { id: 2 } as any] } as RoleEntity;
    repository.findOneBy!.mockResolvedValue(role);
    permissionsService.findOne = jest.fn().mockResolvedValue(permission);

    const result = await service.removePermission(1, 1);

    expect(repository.save).toHaveBeenCalledWith(role);
    expect(role.permissions).toEqual([{ id: 2 }]);
    expect(result.message).toBe('Permiso eliminado');
  });
});
