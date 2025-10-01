import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from 'src/entities/user.entity';
jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repo: any;
  let jwtService: any;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    jwtService = {
      generateToken: jest.fn(),
      refreshToken: jest.fn(),
    };

    service = new UsersService(repo as any, jwtService as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('register should create and save a user', async () => {
    const email = 'a@b.com';
    const password = 'secret';
    const createdUser = { email, password } as UserEntity;
    repo.create.mockReturnValue(createdUser);
    repo.save.mockResolvedValue(createdUser);

    const result = await service.register(email, password);

    expect(repo.create).toHaveBeenCalledWith({ email, password });
    expect(repo.save).toHaveBeenCalledWith(createdUser);
    expect(result).toBe(createdUser);
  });

  it('findByEmail should return user when found', async () => {
    const user = { email: 'x@y.com', roles: [] } as unknown as UserEntity;
    repo.findOne.mockResolvedValue(user);

    const result = await service.findByEmail('x@y.com');

    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'x@y.com' }, relations: ["roles","roles.permissions"] });
    expect(result).toBe(user);
  });

  it('findByEmail should throw NotFoundException when not found', async () => {
    repo.findOne.mockResolvedValue(undefined);

    await expect(service.findByEmail('missing@x.com')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('login should return tokens when credentials are valid', async () => {
    const body = { email: 'u@u.com', password: 'plain' };
    const user = { email: body.email, password: 'hashed' } as UserEntity;
    repo.findOne.mockResolvedValue(user);

    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
    jwtService.generateToken.mockImplementation((payload: any, type: string) => `${type}-token`);

    const tokens = await service.login(body as any);

    expect(tokens).toHaveProperty('accessToken', 'auth-token');
    expect(tokens).toHaveProperty('refreshToken', 'refresh-token');
    expect(jwtService.generateToken).toHaveBeenCalledTimes(2);
  });

  it('login should throw UnauthorizedException when user not found', async () => {
    const body = { email: 'no@one.com', password: 'x' };
    repo.findOne.mockResolvedValue(null);

    await expect(service.login(body as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('login should throw UnauthorizedException on bad password', async () => {
    const body = { email: 'u@u.com', password: 'plain' };
    const user = { email: body.email, password: 'hashed' } as UserEntity;
    repo.findOne.mockResolvedValue(user);

    (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

    await expect(service.login(body as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('canDo should return true when permission exists', async () => {
    const user = { permissionCodes: ['read:users'] } as any;
    await expect(service.canDo(user, 'read:users')).resolves.toBe(true);
  });

  it('canDo should throw UnauthorizedException when permission missing', async () => {
    const user = { permissionCodes: [] } as any;
    await expect(service.canDo(user, 'write:users')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshToken should call jwtService.refreshToken', async () => {
    jwtService.refreshToken.mockReturnValue('ok');
    const res = await service.refreshToken('r');
    expect(jwtService.refreshToken).toHaveBeenCalledWith('r');
    expect(res).toBe('ok');
  });
});
