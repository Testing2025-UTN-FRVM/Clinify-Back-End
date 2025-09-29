import { NotFoundException } from '@nestjs/common';
import { ConsultorioService } from './consultorio.service';
import { ConsultorioEntity } from 'src/entities/consultorio.entity';
import {createMockRepository} from "../../../tests/utils/mock-repository";

describe('ConsultorioService', () => {
    let service: ConsultorioService;
    const repository = createMockRepository<ConsultorioEntity>();

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ConsultorioService(repository as any);
    });

    it('should create a consultorio', async () => {
        const dto = { numero: '101', descripcion: 'Pediatría' } as any;
        const entity = { id: 1, ...dto } as ConsultorioEntity;
        repository.create!.mockReturnValue(entity);
        repository.save!.mockResolvedValue(entity);

        const result = await service.create(dto);

        expect(repository.create).toHaveBeenCalledWith(dto);
        expect(repository.save).toHaveBeenCalledWith(entity);
        expect(result).toBe(entity);
    });

    it('should edit a consultorio', async () => {
        const entity = {id: 1, numero: '101'} as unknown as ConsultorioEntity;
        const dto = { numero: '102' } as any;
        repository.findOneBy!.mockResolvedValue(entity);
        repository.save!.mockResolvedValue({ ...entity, ...dto });

        const result = await service.edit(entity.id, dto);

        expect(repository.merge).toHaveBeenCalledWith(entity, dto);
        expect(repository.save).toHaveBeenCalledWith(entity);
        expect(result).toEqual({ ...entity, ...dto });
    });

    it('should delete a consultorio', async () => {
        const entity = {id: 1, numero: '101'} as unknown as ConsultorioEntity;
        repository.findOneBy!.mockResolvedValue(entity);

        const result = await service.delete(entity.id);

        expect(repository.remove).toHaveBeenCalledWith(entity);
        expect(result.message).toContain(entity.numero);
    });

    it('should return all consultorios', async () => {
        const entities = [{ id: 1 } as ConsultorioEntity];
        repository.find!.mockResolvedValue(entities);

        const result = await service.findAll();

        expect(result).toBe(entities);
        expect(repository.find).toHaveBeenCalled();
    });

    it('should find a consultorio by id', async () => {
        const entity = { id: 1 } as ConsultorioEntity;
        repository.findOneBy!.mockResolvedValue(entity);

        const result = await service.findOne(1);

        expect(result).toBe(entity);
        expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw when consultorio not found', async () => {
        repository.findOneBy!.mockResolvedValue(null);

        await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
});
