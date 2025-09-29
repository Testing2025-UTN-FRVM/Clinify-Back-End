import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionEntity } from 'src/entities/permission.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';

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

  it('should update a permission', async () => {
    const dto = { description: 'Update' } as any;
    const expected = { id: 2 } as PermissionEntity;
    service.update.mockResolvedValue(expected);

    await expect(controller.update(2, dto)).resolves.toBe(expected);
    expect(service.update).toHaveBeenCalledWith(2, dto);
  });

  it('should delete a permission', async () => {
    const expected = { message: 'deleted' };
    service.delete.mockResolvedValue(expected);

    await expect(controller.delete(4)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith(4);
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
});
