import { Test, TestingModule } from '@nestjs/testing';
import { TurnoService } from './turno.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TurnoEntity } from '../../entities/turno.entity';
import { DataSource, Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { ProcedimientoService } from '../procedimiento/procedimiento.service';
import { EmpleadoService } from '../empleado/empleado.service';
import { PacienteService } from '../paciente/paciente.service';
import { EspecialidadService } from '../especialidad/especialidad.service';
import { EstadoTurnoService } from '../estado-turno/estado-turno.service';
import { CreateTurnoDTO } from '../../interfaces/create/create-turno.dto';
import { ProcedimientoEntity } from '../../entities/procedimiento.entity';
import { EmpleadoEntity } from '../../entities/empleado.entity';
import { PacienteEntity } from '../../entities/paciente.entity';
import { EspecialidadEntity } from '../../entities/especialidad.entity';
import { EstadoTurnoEntity } from '../../entities/estadoTurno.entity';

// Mock de todas las dependencias del TurnoService
const mockTurnoRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockProcedimientoService = {
  findOne: jest.fn(),
};

const mockEstadoTurnoService = {
  findOne: jest.fn(),
};

const mockEmpleadoService = {
  findById: jest.fn(),
};

const mockPacienteService = {
  findOne: jest.fn(),
};

const mockEspecialidadService = {
  findOne: jest.fn(),
};

// Mock de la transacción de la base de datos
const mockDataSource = {
  transaction: jest.fn((mode, callback) => callback({
    query: jest.fn(),
    getRepository: jest.fn(() => mockTurnoRepository),
  })),
  query: jest.fn(), // Añadimos mock de query a mockDataSource
};

describe('TurnoService', () => {
  let service: TurnoService;
  let turnoRepository: Repository<TurnoEntity>;
  let procedimientoService: ProcedimientoService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnoService,
        {
          provide: getRepositoryToken(TurnoEntity),
          useValue: mockTurnoRepository,
        },
        {
          provide: ProcedimientoService,
          useValue: mockProcedimientoService,
        },
        {
          provide: EstadoTurnoService,
          useValue: mockEstadoTurnoService,
        },
        {
          provide: EmpleadoService,
          useValue: mockEmpleadoService,
        },
        {
          provide: PacienteService,
          useValue: mockPacienteService,
        },
        {
          provide: EspecialidadService,
          useValue: mockEspecialidadService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TurnoService>(TurnoService);
    turnoRepository = module.get<Repository<TurnoEntity>>(getRepositoryToken(TurnoEntity));
    procedimientoService = module.get<ProcedimientoService>(ProcedimientoService);
    dataSource = module.get<DataSource>(DataSource);

    jest.spyOn(service as any, 'dayKayUTC').mockReturnValue(12345678);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('agendarTurno', () => {
    it('debe agendar un turno exitosamente si no hay solapamiento', async () => {
      // Arrange
      const mockDto: CreateTurnoDTO = {
        fechaHoraTurno: '2025-10-10T10:00:00Z',
        motivo: 'Control anual',
        procedimiento: 1,
        doctor: 1,
        paciente: 1,
        especialidad: 1,
        estado: 1,
      };

      const mockProcedimiento: ProcedimientoEntity = {
        id: 1,
        nombre: 'Limpieza dental',
        duracion: 30, // 30 minutos
      } as ProcedimientoEntity;

  const mockEstado: EstadoTurnoEntity = { id: 1, nombre: 'Pendiente', descripcion: '' } as EstadoTurnoEntity;
  const mockDoctor: EmpleadoEntity = ({
    id: 1,
    nombre: 'Dr. Smith',
    tipoEmpleado: null,
    persona: null,
    user: null,
    especialidad: null,
    procedimientos: [],
    consultorio: null,
    historiasClinicas: [],
    turnos: [],
  } as unknown) as EmpleadoEntity;
  const mockPaciente: PacienteEntity = ({
    id: 1,
    nombre: 'John Doe',
    altura: 0,
    peso: 0,
    observaciones: '',
    persona: null,
    grupoSanguineo: null,
    historiasClinicas: [],
    turnos: [],
  } as unknown) as PacienteEntity;
  const mockEspecialidad: EspecialidadEntity = { id: 1, nombre: 'Odontología' } as EspecialidadEntity;

      const mockNuevoTurno: TurnoEntity = {
        fechaRegistro: new Date(),
        fechaHoraTurno: new Date(mockDto.fechaHoraTurno),
        motivo: mockDto.motivo,
        procedimiento: mockProcedimiento,
        estado: mockEstado,
        doctor: mockDoctor,
        paciente: mockPaciente,
        especialidad: mockEspecialidad,
      } as TurnoEntity;

      (procedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento);
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
        const manager = {
          query: jest.fn()
            .mockResolvedValueOnce([]) // No solapamiento, primera llamada a la consulta SQL
            .mockResolvedValue([]), // No solapamiento, segunda llamada a la consulta SQL
          getRepository: jest.fn(() => mockTurnoRepository),
        };
        return await callback(manager);
      });
      (mockEstadoTurnoService.findOne as jest.Mock).mockResolvedValue(mockEstado);
      (mockEmpleadoService.findById as jest.Mock).mockResolvedValue(mockDoctor);
      (mockPacienteService.findOne as jest.Mock).mockResolvedValue(mockPaciente);
      (mockEspecialidadService.findOne as jest.Mock).mockResolvedValue(mockEspecialidad);
      (mockTurnoRepository.create as jest.Mock).mockReturnValue(mockNuevoTurno);
      (mockTurnoRepository.save as jest.Mock).mockResolvedValue(mockNuevoTurno);

      // Act
      const result = await service.agendarTurno(mockDto);

      // Assert
      expect(result).toEqual(mockNuevoTurno);
      expect(procedimientoService.findOne).toHaveBeenCalledWith(mockDto.procedimiento);
      expect(mockTurnoRepository.create).toHaveBeenCalledWith(expect.objectContaining({ motivo: mockDto.motivo }));
      expect(mockTurnoRepository.save).toHaveBeenCalledWith(mockNuevoTurno);
    });

    it('debe lanzar un ConflictException si la fecha es invalida', async () => {
      // Arrange
      const mockDto: CreateTurnoDTO = {
        fechaHoraTurno: 'fecha invalida',
        motivo: 'Control',
        procedimiento: 1,
        doctor: 1,
        paciente: 1,
        especialidad: 1,
        estado: 1,
      };

      // Act & Assert
      await expect(service.agendarTurno(mockDto)).rejects.toThrow(ConflictException);
      await expect(service.agendarTurno(mockDto)).rejects.toThrow('FechaHora invalida');
    });

    it('debe lanzar un ConflictException si el doctor ya tiene un turno en ese horario', async () => {
      // Arrange
      const mockDto: CreateTurnoDTO = {
        fechaHoraTurno: '2025-10-10T10:00:00Z',
        motivo: 'Consulta',
        procedimiento: 1,
        doctor: 1,
        paciente: 1,
        especialidad: 1,
        estado: 1,
      };
      
      const mockProcedimiento: ProcedimientoEntity = {
        id: 1,
        nombre: 'Limpieza dental',
        duracion: 30, // 30 minutos
      } as ProcedimientoEntity;
      
      (procedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento);
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
        const manager = {
          query: jest.fn()
            .mockResolvedValueOnce([{ '1': 1 }]) // Simula solapamiento, la primera llamada devuelve un resultado
            .mockResolvedValue([]),
          getRepository: jest.fn(() => mockTurnoRepository),
        };
        return await callback(manager);
      });

      // Act & Assert
      await expect(service.agendarTurno(mockDto)).rejects.toThrow(ConflictException);
      await expect(service.agendarTurno(mockDto)).rejects.toThrow('El doctor ya tiene un turno en ese horario');
      expect(procedimientoService.findOne).toHaveBeenCalledWith(mockDto.procedimiento);
    });

  });
});
