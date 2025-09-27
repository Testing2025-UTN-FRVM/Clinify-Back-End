import { NotFoundException } from '@nestjs/common';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { PacienteService } from './paciente.service';
import { PacienteEntity } from '../../entities/paciente.entity';
import { GrupoSanguineoService } from '../grupo-sanguineo/grupo-sanguineo.service';
import { PersonaService } from '../persona/persona.service';

const createManager = () => {
  const repository = {
    save: jest.fn(),
  };
  return {
    getRepository: jest.fn().mockReturnValue(repository),
    repository,
  };
};

describe('PacienteService', () => {
  const repository = createMockRepository<PacienteEntity>();
  const grupoSanguineoService = {
    findById: jest.fn(),
  } as unknown as GrupoSanguineoService;
  const personaService = {
    create: jest.fn(),
  } as unknown as PersonaService;
  const dataSource = {
    transaction: jest.fn(),
  } as any;
  let service: PacienteService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PacienteService(grupoSanguineoService, personaService, repository as any, dataSource);
  });

  it('creates a patient using a transaction', async () => {
    const dto = { idGrupoSanguineo: 1, altura: 180, peso: 80, observaciones: 'N/A' } as any;
    const grupo = { id: 1 } as any;
    const persona = { id: 2 } as any;
    const paciente = { id: 3 } as PacienteEntity;
    const manager = createManager();
    (manager.repository.save as jest.Mock).mockResolvedValue(paciente);
    grupoSanguineoService.findById = jest.fn().mockResolvedValue(grupo);
    personaService.create = jest.fn().mockResolvedValue(persona);
    repository.create!.mockReturnValue(paciente);
    dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));

    const result = await service.create(dto);

    expect(grupoSanguineoService.findById).toHaveBeenCalledWith(dto.idGrupoSanguineo);
    expect(personaService.create).toHaveBeenCalledWith(dto, manager);
    expect(repository.create).toHaveBeenCalledWith({
      altura: dto.altura,
      peso: dto.peso,
      observaciones: dto.observaciones,
      persona,
      grupoSanguineo: grupo,
    });
    expect(manager.getRepository).toHaveBeenCalled();
    expect(result).toBe(paciente);
  });

  it('edits a patient updating blood group', async () => {
    const dto = { idGrupoSanguineo: 2, observaciones: 'Updated' } as any;
    const existing = { id: 1, grupoSanguineo: { id: 1 } } as PacienteEntity;
    const newGroup = { id: 2 } as any;
    repository.findOne!.mockResolvedValue(existing);
    grupoSanguineoService.findById = jest.fn().mockResolvedValue(newGroup);
    repository.save!.mockResolvedValue({ ...existing, ...dto, grupoSanguineo: newGroup });

    const result = await service.edit(existing.id, dto);

    expect(grupoSanguineoService.findById).toHaveBeenCalledWith(dto.idGrupoSanguineo);
    expect(repository.merge).toHaveBeenCalledWith(existing, dto);
    expect(repository.save).toHaveBeenCalledWith(existing);
    expect(result.grupoSanguineo).toBe(newGroup);
  });

  it('edits a patient without changing blood group', async () => {
    const dto = { observaciones: 'Updated' } as any;
    const existing = { id: 1, grupoSanguineo: { id: 1 } } as PacienteEntity;
    repository.findOne!.mockResolvedValue(existing);
    repository.save!.mockResolvedValue({ ...existing, ...dto });

    const result = await service.edit(existing.id, dto);

    expect(grupoSanguineoService.findById).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(existing);
    expect(result.observaciones).toBe('Updated');
  });

  it('finds a patient by id', async () => {
    const entity = { id: 1 } as PacienteEntity;
    repository.findOne!.mockResolvedValue(entity);

    const result = await service.findOne(1);

    expect(result).toBe(entity);
  });

  it('throws when patient not found', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('returns all patients', async () => {
    const entities = [{ id: 1 } as PacienteEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findAll();

    expect(result).toBe(entities);
  });
});
