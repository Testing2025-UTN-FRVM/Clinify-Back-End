import { ConflictException } from '@nestjs/common';
import { createMockRepository } from '../../../test/utils/mock-repository';
import { HistoriaClinicaService } from './historia-clinica.service';
import { HistoriaClinicaEntity } from '../../entities/historiaClinica.entity';
import { PacienteService } from '../paciente/paciente.service';
import { EmpleadoService } from '../empleado/empleado.service';

const createUser = (email: string) => ({ email } as any);

const createDoctor = (user: any) => ({ user } as any);

describe('HistoriaClinicaService', () => {
  const repository = createMockRepository<HistoriaClinicaEntity>();
  const pacienteService = { findOne: jest.fn() } as unknown as PacienteService;
  const empleadoService = { findByUser: jest.fn() } as unknown as EmpleadoService;
  let service: HistoriaClinicaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HistoriaClinicaService(repository as any, pacienteService, empleadoService);
  });

  it('creates a historia clinica', async () => {
    const dto = { paciente: 1, entrada: 'Consulta', observacionExtra: 'N/A' } as any;
    const paciente = { id: 1 } as any;
    const doctor = createDoctor('doctor@example.com');
    const entity = { id: 1 } as HistoriaClinicaEntity;
    pacienteService.findOne = jest.fn().mockResolvedValue(paciente);
    empleadoService.findByUser = jest.fn().mockResolvedValue(doctor);
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto, createUser('doctor@example.com'));

    expect(pacienteService.findOne).toHaveBeenCalledWith(dto.paciente);
    expect(empleadoService.findByUser).toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalled();
    expect(result).toBe(entity);
  });

  it('edits a historia clinica within allowed time', async () => {
    const user = createUser('doctor@example.com');
    const historia = {
      id: 1,
      fechaEntrada: new Date(Date.now() - 5 * 60 * 1000),
      doctor: createDoctor(user),
    } as HistoriaClinicaEntity;
    const dto = { observacionExtra: 'Actualizado' } as any;
    repository.findOneBy!.mockResolvedValue(historia);
    repository.save!.mockResolvedValue({ ...historia, ...dto });

    const result = await service.edit(historia.id, dto, user);

    expect(repository.merge).toHaveBeenCalledWith(historia, dto);
    expect(repository.save).toHaveBeenCalledWith(historia);
    expect(result.observacionExtra).toBe('Actualizado');
  });

  it('throws if editing history of another doctor', async () => {
    const user = createUser('other@example.com');
    const historia = {
      id: 1,
      fechaEntrada: new Date(),
      doctor: createDoctor(createUser('doctor@example.com')),
    } as HistoriaClinicaEntity;
    repository.findOneBy!.mockResolvedValue(historia);

    await expect(service.edit(historia.id, {}, user)).rejects.toThrow(ConflictException);
  });

  it('throws if editing after 15 minutes', async () => {
    const user = createUser('doctor@example.com');
    const historia = {
      id: 1,
      fechaEntrada: new Date(Date.now() - 20 * 60 * 1000),
      doctor: createDoctor(user),
    } as HistoriaClinicaEntity;
    repository.findOneBy!.mockResolvedValue(historia);

    await expect(service.edit(historia.id, {}, user)).rejects.toThrow(ConflictException);
  });

  it('finds histories by patient', async () => {
    const entities = [{ id: 1 } as HistoriaClinicaEntity];
    repository.find!.mockResolvedValue(entities);

    const result = await service.findByPatient(1);

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        paciente: {
          id: 1,
        },
      },
    });
    expect(result).toBe(entities);
  });

  it('finds one history', async () => {
    const entity = { id: 1 } as HistoriaClinicaEntity;
    repository.findOneBy!.mockResolvedValue(entity);

    const result = await service.findOne(1);

    expect(result).toBe(entity);
  });

  it('throws when history not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow('El id: 1 no corresponde a ninguna historia clinica');
  });
});
