import { createMockRepository } from '../../../test/utils/mock-repository';
import { PersonaService } from './persona.service';
import { PersonaEntity } from '../../entities/persona.entity';

describe('PersonaService', () => {
  const repository = createMockRepository<PersonaEntity>();
  let service: PersonaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PersonaService(repository as any);
  });

  it('creates a persona without manager', async () => {
    const dto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      fechaNacimiento: new Date(),
      tipoDocumento: 'DNI',
      nroDocumento: '123',
      telefono: '555',
    } as any;
    const entity = { id: 1, ...dto } as PersonaEntity;
    repository.create!.mockReturnValue(entity);
    repository.save!.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith({
      nombre: dto.nombre,
      apellido: dto.apellido,
      fechaNacimiento: dto.fechaNacimiento,
      tipoDocumento: dto.tipoDocumento,
      numeroDocumento: dto.nroDocumento,
      telefono: dto.telefono,
    });
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('creates a persona using manager repository', async () => {
    const createMock = jest.fn().mockReturnValue({ id: 1 } as PersonaEntity);
    const saveMock = jest.fn().mockResolvedValue({ id: 1 } as PersonaEntity);
    const manager = {
      getRepository: jest.fn().mockReturnValue({ create: createMock, save: saveMock }),
    } as any;

    const dto = { nombre: 'Ana', apellido: 'López' } as any;

    const result = await service.create(dto, manager);

    expect(manager.getRepository).toHaveBeenCalled();
    expect(createMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 1 });
  });

  it('edits a persona', async () => {
    const entity = { id: 1, nombre: 'Juan' } as PersonaEntity;
    const dto = { nombre: 'Pedro' } as any;
    repository.findOneBy!.mockResolvedValue(entity);
    repository.save!.mockResolvedValue({ ...entity, ...dto });

    const result = await service.edit(entity.id, dto);

    expect(repository.merge).toHaveBeenCalledWith(entity, dto);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual({ ...entity, ...dto });
  });

  it('throws when finding non existing persona', async () => {
    repository.findOneBy!.mockResolvedValue(null);
    await expect((service as any).findOne(1)).rejects.toThrow('No existe la persona con el id: 1');
  });
});
