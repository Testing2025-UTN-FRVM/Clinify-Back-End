import { Test, TestingModule } from '@nestjs/testing';
import { EstadoTurnoService } from './estado-turno.service';

describe('EstadoTurnoService', () => {
  let service: EstadoTurnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoTurnoService],
    }).compile();

    service = module.get<EstadoTurnoService>(EstadoTurnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
