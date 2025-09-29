import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from 'src/entities/role.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';

describe('RolesController', () => {
  let controller: RolesController;
  let service: jest.Mocked<RolesService>;

  const mockService = () => ({
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    assignPermissions: jest.fn(),
    removePermission: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(RolesController);
    service = module.get(RolesService);
  });

  it('should create a role', async () => {
    const dto = { nombre: 'Admin' } as any;
    const expected = { id: 1 } as RoleEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should update a role', async () => {
    const dto = { nombre: 'Manager' } as any;
    const expected = { id: 2 } as RoleEntity;
    service.update.mockResolvedValue(expected);

    await expect(controller.update(dto, 2)).resolves.toBe(expected);
    expect(service.update).toHaveBeenCalledWith(2, dto);
  });

  it('should delete a role', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(3)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(3);
  });

  it('should list roles', async () => {
    const expected = [{ id: 1 }] as RoleEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should find a role', async () => {
    const expected = { id: 4 } as RoleEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(4)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(4);
  });

  it('should assign permissions', async () => {
    const dto = { permissionsIds: [1] } as any;
    const expected = { id: 5 } as RoleEntity;
    service.assignPermissions.mockResolvedValue(expected);

    await expect(controller.assignPermissions(5, dto)).resolves.toBe(expected);
    expect(service.assignPermissions).toHaveBeenCalledWith(5, dto);
  });

  it('should remove a permission', async () => {
    const expected = { message: 'removed' };
    service.removePermission.mockResolvedValue(expected);

    await expect(controller.removePermission(6, 9)).resolves.toBe(expected);
    expect(service.removePermission).toHaveBeenCalledWith(6, 9);
  });
});
