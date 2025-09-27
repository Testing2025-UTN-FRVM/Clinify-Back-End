import { TurnoService } from './turno.service';
import { CreateTurnoDTO } from '../../interfaces/create/create-turno.dto';

const createManager = () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
  };
  return {
    query: jest.fn(),
    getRepository: jest.fn().mockReturnValue(repository),
    repository,
  };
};

describe('TurnoService', () => {
  const procedimientoService = { findOne: jest.fn() } as any;
  const estadoTurnoService = { findOne: jest.fn() } as any;
  const empleadoService = { findById: jest.fn() } as any;
  const pacienteService = { findOne: jest.fn() } as any;
  const especialidadService = { findOne: jest.fn() } as any;
  const dataSource = { transaction: jest.fn() } as any;
  const turnoRepository = {} as any;
  let service: TurnoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TurnoService(
      turnoRepository,
      procedimientoService,
      estadoTurnoService,
      empleadoService,
      pacienteService,
      especialidadService,
      dataSource,
    );
  });

  const baseDto: CreateTurnoDTO = {
    fechaHoraTurno: '2025-10-10T10:00:00Z',
    motivo: 'Consulta',
    procedimiento: 1,
    doctor: 1,
    paciente: 1,
    especialidad: 1,
  } as any;

  it('agends a turno successfully', async () => {
    const manager = createManager();
    const procedimiento = { duracion: 30 };
    const estado = { id: 1 };
    const doctor = { id: 1 };
    const paciente = { id: 1 };
    const especialidad = { id: 1 };
    const turno = { id: 99 };
    manager.query.mockImplementation(async (sql: string) => (sql.includes('SELECT 1') ? [] : []));
    manager.repository.create.mockReturnValue(turno);
    manager.repository.save.mockResolvedValue(turno);
    procedimientoService.findOne = jest.fn().mockResolvedValue(procedimiento);
    estadoTurnoService.findOne = jest.fn().mockResolvedValue(estado);
    empleadoService.findById = jest.fn().mockResolvedValue(doctor);
    pacienteService.findOne = jest.fn().mockResolvedValue(paciente);
    especialidadService.findOne = jest.fn().mockResolvedValue(especialidad);
    dataSource.transaction.mockImplementation(async (_iso: any, cb: any) => cb(manager));

    const result = await service.agendarTurno(baseDto);

    expect(manager.query).toHaveBeenCalled();
    expect(manager.repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        motivo: baseDto.motivo,
        procedimiento,
        doctor,
        paciente,
        especialidad,
      }),
    );
    expect(result).toBe(turno);
  });

  it('throws when date is invalid', async () => {
    const dto = { ...baseDto, fechaHoraTurno: 'invalid' };
    dataSource.transaction.mockImplementation(async (_iso: any, cb: any) => cb(createManager()));

    await expect(service.agendarTurno(dto)).rejects.toThrow('FechaHora invalida');
  });

  it('throws when doctor already has appointment', async () => {
    const manager = createManager();
    const procedimiento = { duracion: 30 };
    procedimientoService.findOne = jest.fn().mockResolvedValue(procedimiento);
    manager.query.mockImplementation(async (sql: string) => (sql.includes('SELECT 1') ? [{ id: 1 }] : []));
    dataSource.transaction.mockImplementation(async (_iso: any, cb: any) => cb(manager));

    await expect(service.agendarTurno(baseDto)).rejects.toThrow('El doctor ya tiene un turno en ese horario');
  });
});
