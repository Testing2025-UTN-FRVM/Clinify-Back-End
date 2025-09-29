import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from 'src/entities/user.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { LoginDTO } from 'src/interfaces/login.dto';
import { AssignRoleDTO } from 'src/interfaces/assign.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockService = () => ({
    login: jest.fn(),
    canDo: jest.fn(),
    refreshToken: jest.fn(),
    assignRoles: jest.fn(),
    removeRole: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
  });

  it('should return current user email', () => {
    const req = { user: { email: 'test@email.com' } } as any;
    expect(controller.me(req)).toEqual({ email: 'test@email.com' });
  });

  it('should login a user', async () => {
    const dto = { email: 'test@email.com', password: '123' } as any;
    const expected = { token: 'abc' } as any;
    service.login.mockResolvedValue(expected);

    await expect(controller.login(dto)).resolves.toBe(expected);
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('should bubble up login errors', async () => {
    const dto = { email: 'test@email.com', password: '123' } as any;
    const error = new ForbiddenException('invalid credentials');
    service.login.mockRejectedValue(error);

    await expect(controller.login(dto)).rejects.toBe(error);
  });

  it('should check permissions', async () => {
    const req = { user: { id: 1 } } as any;
    service.canDo.mockResolvedValue(true);

    await expect(controller.canDo(req, 'PERMISSION')).resolves.toBe(true);
    expect(service.canDo).toHaveBeenCalledWith(req.user, 'PERMISSION');
  });

  it('should bubble up canDo errors', async () => {
    const req = { user: { id: 1 } } as any;
    const error = new NotFoundException('user not found');
    service.canDo.mockRejectedValue(error);

    await expect(controller.canDo(req, 'PERMISSION')).rejects.toBe(error);
  });

  it('should refresh a token from headers', async () => {
    const request = { headers: { 'refresh-token': 'token' } } as any;
    const expected = { token: 'new' } as any;
    service.refreshToken.mockResolvedValue(expected);

    await expect(controller.refreshToken(request)).resolves.toBe(expected);
    expect(service.refreshToken).toHaveBeenCalledWith('token');
  });

  it('should bubble up refresh errors', async () => {
    const request = { headers: { 'refresh-token': 'token' } } as any;
    const error = new NotFoundException('session not found');
    service.refreshToken.mockRejectedValue(error);

    await expect(controller.refreshToken(request)).rejects.toBe(error);
  });

  it('should assign a role to a user', async () => {
    const dto = { roleIds: [1] } as any;
    const expected = { id: 3 } as UserEntity;
    service.assignRoles.mockResolvedValue(expected);

    await expect(controller.assignRole(3, dto)).resolves.toBe(expected);
    expect(service.assignRoles).toHaveBeenCalledWith(3, dto);
  });

  it('should bubble up assignment errors', async () => {
    const dto = { roleIds: [1] } as any;
    const error = new NotFoundException('role not found');
    service.assignRoles.mockRejectedValue(error);

    await expect(controller.assignRole(3, dto)).rejects.toBe(error);
  });

  it('should remove a role from a user', async () => {
    const expected = { message: 'removed' };
    service.removeRole.mockResolvedValue(expected);

    await expect(controller.removeRole(3, 4)).resolves.toBe(expected);
    expect(service.removeRole).toHaveBeenCalledWith(3, 4);
  });

  it('should bubble up remove role errors', async () => {
    const error = new NotFoundException('role not found');
    service.removeRole.mockRejectedValue(error);

    await expect(controller.removeRole(3, 4)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty login payload', async () => {
      const dto = plainToInstance(LoginDTO, {});
      const errors = await validate(dto);

      expect(errors.map((err) => err.property).sort()).toEqual([
        'email',
        'password',
      ]);
    });

    it('should invalidate assign role payload without ids', async () => {
      const dto = plainToInstance(AssignRoleDTO, {});
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('roleIds');
    });
  });
});
