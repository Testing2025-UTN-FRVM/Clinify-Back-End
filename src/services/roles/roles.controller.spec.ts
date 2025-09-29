import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from 'src/entities/role.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateRoleDTO } from 'src/interfaces/create/create-role.dto';
import { AssignPermissionsDTO } from 'src/interfaces/assign.dto';

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

  it('should bubble up creation errors', async () => {
    const dto = { nombre: 'Admin' } as any;
    const error = new NotFoundException('role conflict');
    service.create.mockRejectedValue(error);

    await expect(controller.create(dto)).rejects.toBe(error);
  });

  it('should update a role', async () => {
    const dto = { nombre: 'Manager' } as any;
    const expected = { id: 2 } as RoleEntity;
    service.update.mockResolvedValue(expected);

    await expect(controller.update(dto, 2)).resolves.toBe(expected);
    expect(service.update).toHaveBeenCalledWith(2, dto);
  });

  it('should bubble up update errors', async () => {
    const dto = { nombre: 'Manager' } as any;
    const error = new NotFoundException('role not found');
    service.update.mockRejectedValue(error);

    await expect(controller.update(dto, 2)).rejects.toBe(error);
  });

  it('should delete a role', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(3)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(3);
  });

  it('should bubble up deletion errors', async () => {
    const error = new NotFoundException('role not found');
    service.delete.mockRejectedValue(error);

    await expect(controller.delete(3)).rejects.toBe(error);
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

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('role not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(4)).rejects.toBe(error);
  });

  it('should assign permissions', async () => {
    const dto = { permissionCodes: [1] } as any;
    const expected = { id: 5 } as RoleEntity;
    service.assignPermissions.mockResolvedValue(expected);

    await expect(controller.assignPermissions(5, dto)).resolves.toBe(expected);
    expect(service.assignPermissions).toHaveBeenCalledWith(5, dto);
  });

  it('should bubble up assignment errors', async () => {
    const dto = { permissionCodes: [1] } as any;
    const error = new NotFoundException('permission not found');
    service.assignPermissions.mockRejectedValue(error);

    await expect(controller.assignPermissions(5, dto)).rejects.toBe(error);
  });

  it('should remove a permission', async () => {
    const expected = { message: 'removed' };
    service.removePermission.mockResolvedValue(expected);

    await expect(controller.removePermission(6, 9)).resolves.toBe(expected);
    expect(service.removePermission).toHaveBeenCalledWith(6, 9);
  });

  it('should bubble up removal errors', async () => {
    const error = new NotFoundException('permission not found');
    service.removePermission.mockRejectedValue(error);

    await expect(controller.removePermission(6, 9)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateRoleDTO, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should invalidate assign permissions payload without ids', async () => {
      const dto = plainToInstance(AssignPermissionsDTO, {});
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('permissionCodes');
    });
  });
});
