import { Test, TestingModule } from '@nestjs/testing';
import { TurnoController } from './turno.controller';
import { TurnoService } from './turno.service';
import { CreateTurnoDTO } from '../../interfaces/create/create-turno.dto';
import { TurnoEntity } from '../../entities/turno.entity';

// Mock del servicio de turnos para aislar el controlador
const mockTurnoService = {
  agendarTurno: jest.fn(),
};

describe('TurnoController', () => {
  let controller: TurnoController;
  let service: TurnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurnoController],
      providers: [
        {
          provide: TurnoService,
          useValue: mockTurnoService,
        },
      ],
    }).compile();

    controller = module.get<TurnoController>(TurnoController);
    service = module.get<TurnoService>(TurnoService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  // --- Pruebas de los métodos del controlador ---
  describe('agendarTurno', () => {
    it('debe llamar al servicio para agendar un turno y devolver el resultado', async () => {
      // Arrange
      const createTurnoDto: CreateTurnoDTO = {
        fechaHoraTurno: '2025-10-10T10:00:00Z',
        motivo: 'Consulta',
        procedimiento: 1,
        doctor: 1,
        paciente: 1,
        especialidad: 1,
      };

      const expectedResult: TurnoEntity = {
        id: 1,
        ...createTurnoDto,
        fechaRegistro: new Date(),
        //... otras propiedades de TurnoEntity
      } as TurnoEntity;

      jest.spyOn(service, 'agendarTurno').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.agendarTurno(createTurnoDto);

      // Assert
      expect(service.agendarTurno).toHaveBeenCalledWith(createTurnoDto);
      expect(result).toEqual(expectedResult);
    });

    it('debe manejar las excepciones lanzadas por el servicio', async () => {
      // Arrange
      const createTurnoDto: CreateTurnoDTO = {
        fechaHoraTurno: 'fecha invalida',
        motivo: 'Consulta',
        procedimiento: 1,
        doctor: 1,
        paciente: 1,
        especialidad: 1,
      };

      jest.spyOn(service, 'agendarTurno').mockRejectedValue(new Error('Fecha invalida'));

      // Act & Assert
      await expect(controller.agendarTurno(createTurnoDto)).rejects.toThrow('Fecha invalida');
    });
  });
});
