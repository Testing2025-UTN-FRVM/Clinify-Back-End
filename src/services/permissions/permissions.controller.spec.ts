import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionEntity } from 'src/entities/permission.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreatePermissionDTO } from 'src/interfaces/create/create-permission.dto';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: jest.Mocked<PermissionsService>;

  const mockService = () => ({
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(PermissionsController);
    service = module.get(PermissionsService);
  });

  it('should create a permission', async () => {
    const dto = { description: 'Create' } as any;
    const expected = { id: 1 } as PermissionEntity;
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should bubble up creation errors', async () => {
    const dto = { description: 'Create' } as any;
    const error = new NotFoundException('permission conflict');
    service.create.mockRejectedValue(error);

    await expect(controller.create(dto)).rejects.toBe(error);
  });

  it('should update a permission', async () => {
    const dto = { description: 'Update' } as any;
    const expected = { id: 2 } as PermissionEntity;
    service.update.mockResolvedValue(expected);

    await expect(controller.update(2, dto)).resolves.toBe(expected);
    expect(service.update).toHaveBeenCalledWith(2, dto);
  });

  it('should bubble up update errors', async () => {
    const dto = { description: 'Update' } as any;
    const error = new NotFoundException('permission not found');
    service.update.mockRejectedValue(error);

    await expect(controller.update(2, dto)).rejects.toBe(error);
  });

  it('should delete a permission', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(4)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(4);
  });

  it('should bubble up deletion errors', async () => {
    const error = new NotFoundException('permission not found');
    service.delete.mockRejectedValue(error);

    await expect(controller.delete(4)).rejects.toBe(error);
  });

  it('should list all permissions', async () => {
    const expected = [{ id: 1 }] as PermissionEntity[];
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should find one permission', async () => {
    const expected = { id: 5 } as PermissionEntity;
    service.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(5)).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('should bubble up lookup errors', async () => {
    const error = new NotFoundException('permission not found');
    service.findOne.mockRejectedValue(error);

    await expect(controller.findOne(5)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreatePermissionDTO, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('code');
    });
  });
});
