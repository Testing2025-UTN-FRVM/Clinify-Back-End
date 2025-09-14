
import { Test, TestingModule } from '@nestjs/testing';
import { ProcedimientoService } from './procedimiento.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProcedimientoEntity } from '../../entities/procedimiento.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const procedimientoArray = [
  { id: 1, nombre: 'Proc1', descripcion: 'Desc1', duracion: 30 },
  { id: 2, nombre: 'Proc2', descripcion: 'Desc2', duracion: 45 },
];

describe('ProcedimientoService', () => {
  let service: ProcedimientoService;
  let repo: Repository<ProcedimientoEntity>;

  const mockRepo = {
    create: jest.fn(dto => ({ ...dto })),
    save: jest.fn(entity => Promise.resolve({ id: 1, ...entity })),
    merge: jest.fn((entity, dto) => ({ ...entity, ...dto })),
    remove: jest.fn(entity => Promise.resolve(entity)),
    find: jest.fn(() => Promise.resolve(procedimientoArray)),
    findOneBy: jest.fn(({ id }) =>
      Promise.resolve(procedimientoArray.find(p => p.id === id) || null)
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcedimientoService,
        {
          provide: getRepositoryToken(ProcedimientoEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ProcedimientoService>(ProcedimientoService);
    repo = module.get<Repository<ProcedimientoEntity>>(getRepositoryToken(ProcedimientoEntity));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a procedimiento', async () => {
      const dto = { nombre: 'Nuevo', descripcion: 'Desc', duracion: 20 };
      const result = await service.create(dto as any);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all procedimientos', async () => {
      const result = await service.findAll();
      expect(result).toEqual(procedimientoArray);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a procedimiento by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(procedimientoArray[0]);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
    it('should throw NotFoundException if not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('patch', () => {
    it('should patch and save a procedimiento', async () => {
      const patchDto = { descripcion: 'Modificado' };
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(procedimientoArray[0] as any);
      const result = await service.patch(1, patchDto as any);
      expect(repo.merge).toHaveBeenCalledWith(procedimientoArray[0], patchDto);
      expect(repo.save).toHaveBeenCalledWith({ ...procedimientoArray[0], ...patchDto });
      expect(result).toEqual({ ...procedimientoArray[0], ...patchDto });
    });
  });

  describe('delete', () => {
    it('should remove a procedimiento and return message', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(procedimientoArray[0] as any);
      const result = await service.delete(1);
      expect(repo.remove).toHaveBeenCalledWith(procedimientoArray[0]);
      expect(result).toEqual({ message: `Procedimiento: ${procedimientoArray[0].nombre} eliminado correctamente` });
    });
  });
});
