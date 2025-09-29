import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { UsersService } from './users.service';
import { UserEntity } from '../../entities/user.entity';
import { JwtService } from '../../jwt/jwt.service';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  const repository = createMockRepository<UserEntity>();
  const jwtService = {
    generateToken: jest.fn(),
    refreshToken: jest.fn(),
  } as unknown as JwtService;
  const rolesService = {
    findOne: jest.fn(),
  } as unknown as RolesService;
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(repository as any, jwtService, rolesService);
  });

  it('registers a new user', async () => {
    const email = 'user@example.com';
    const password = 'secret';
    const user = { id: 1, email, password } as UserEntity;
    repository.create!.mockReturnValue(user);
    repository.save!.mockResolvedValue(user);

    const result = await service.register(email, password);

    expect(repository.create).toHaveBeenCalledWith({ email, password });
    expect(repository.save).toHaveBeenCalledWith(user);
    expect(result).toBe(user);
  });

  it('finds a user by email', async () => {
    const user = { id: 1, email: 'user@example.com' } as UserEntity;
    repository.findOne!.mockResolvedValue(user);

    const result = await service.findByEmail(user.email);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: user.email },
      relations: ['roles', 'roles.permissions'],
    });
    expect(result).toBe(user);
  });

  it('throws when user not found by email', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.findByEmail('missing@example.com')).rejects.toThrow(NotFoundException);
  });

  it('logs in user with valid credentials', async () => {
    const body = { email: 'user@example.com', password: 'plain' } as any;
    const user = { email: body.email, password: 'hashed' } as UserEntity;
    repository.findOne!.mockResolvedValue(user);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
    (jwtService.generateToken as jest.Mock).mockImplementation((payload: any, type: string) => `${type}-token`);

    const result = await service.login(body);

    expect(result.accessToken).toBe('auth-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(jwtService.generateToken).toHaveBeenCalledTimes(2);
  });

  it('throws when logging in missing user', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.login({ email: 'missing', password: 'x' } as any)).rejects.toThrow(NotFoundException);
  });

  it('throws when password is invalid', async () => {
    const body = { email: 'user@example.com', password: 'plain' } as any;
    const user = { email: body.email, password: 'hashed' } as UserEntity;
    repository.findOne!.mockResolvedValue(user);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

    await expect(service.login(body)).rejects.toThrow(UnauthorizedException);
  });

  it('validates permissions', async () => {
    const user = { permissionCodes: ['read:users'] } as any;

    await expect(service.canDo(user, 'read:users')).resolves.toBe(true);
  });

  it('throws when user lacks permission', async () => {
    const user = { permissionCodes: [] } as any;

    await expect(service.canDo(user, 'write:users')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshes token', async () => {
    (jwtService.refreshToken as jest.Mock).mockReturnValue('new-token');

    const result = await service.refreshToken('old-token');

    expect(jwtService.refreshToken).toHaveBeenCalledWith('old-token');
    expect(result).toBe('new-token');
  });

  it('assigns roles to a user without roles', async () => {
    const user = { id: 1, roles: [] } as UserEntity;
    const role = { id: 2 } as any;
    repository.findOne!.mockResolvedValueOnce(user);
    rolesService.findOne = jest.fn().mockResolvedValue(role);
    repository.save!.mockResolvedValue({ ...user, roles: [role] });

    const result = await service.assignRoles(1, { roleIds: [2] } as any);

    expect(rolesService.findOne).toHaveBeenCalledWith(2);
    expect(repository.save).toHaveBeenCalledWith(user);
    expect(result.roles).toContain(role);
  });

  it('assigns roles appending to existing roles', async () => {
    const existingRole = { id: 1 } as any;
    const newRole = { id: 2 } as any;
    const user = { id: 1, roles: [existingRole] } as UserEntity;
    repository.findOne!.mockResolvedValueOnce(user);
    rolesService.findOne = jest.fn().mockResolvedValue(newRole);
    repository.save!.mockResolvedValue({ ...user, roles: [existingRole, newRole] });

    const result = await service.assignRoles(1, { roleIds: [2] } as any);

    expect(user.roles).toEqual([existingRole, newRole]);
    expect(result.roles).toEqual([existingRole, newRole]);
  });

  it('removes a role from user', async () => {
    const role = { id: 1 } as any;
    const otherRole = { id: 2 } as any;
    const user = { id: 1, roles: [role, otherRole] } as UserEntity;
    repository.findOne!.mockResolvedValueOnce(user);
    rolesService.findOne = jest.fn().mockResolvedValue(role);

    const result = await service.removeRole(1, 1);

    expect(rolesService.findOne).toHaveBeenCalledWith(1);
    expect(user.roles).toEqual([otherRole]);
    expect(repository.save).toHaveBeenCalledWith(user);
    expect(result.message).toBe('Rol eliminado');
  });

  it('throws when user not found in private findById', async () => {
    repository.findOne!.mockResolvedValueOnce(null);

    await expect((service as any).findById(1)).rejects.toThrow('El usuario no existe');
  });
});
