import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TurnoController } from './turno.controller';
import { TurnoService } from './turno.service';
import { TurnoEntity } from 'src/entities/turno.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { CreateTurnoDTO } from 'src/interfaces/create/create-turno.dto';

describe('TurnoController', () => {
  let controller: TurnoController;
  let service: jest.Mocked<TurnoService>;

  const mockService = () => ({
    agendarTurno: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurnoController],
      providers: [
        {
          provide: TurnoService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(TurnoController);
    service = module.get(TurnoService);
  });

  it('should schedule a turno', async () => {
    const dto = { fecha: new Date() } as any;
    const expected = { id: 1 } as TurnoEntity;
    service.agendarTurno.mockResolvedValue(expected);

    await expect(controller.agendarTurno(dto)).resolves.toBe(expected);
    expect(service.agendarTurno).toHaveBeenCalledWith(dto);
  });

  it('should bubble up scheduling errors', async () => {
    const dto = { fecha: new Date() } as any;
    const error = new NotFoundException('doctor unavailable');
    service.agendarTurno.mockRejectedValue(error);

    await expect(controller.agendarTurno(dto)).rejects.toBe(error);
  });

  describe('DTO validation', () => {
    it('should invalidate empty create payload', async () => {
      const dto = plainToInstance(CreateTurnoDTO, {});
      const errors = await validate(dto);
      const properties = errors.map((err) => err.property).sort();

      expect(properties).toEqual(
        [
          'doctor',
          'estado',
          'especialidad',
          'fechaHoraTurno',
          'motivo',
          'paciente',
          'procedimiento',
        ].sort(),
      );
    });
  });
});
