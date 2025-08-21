import { Test, TestingModule } from '@nestjs/testing';
import { TipoEmpleadoService } from './tipo-empleado.service';

describe('TipoEmpleadoService', () => {
  let service: TipoEmpleadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoEmpleadoService],
    }).compile();

    service = module.get<TipoEmpleadoService>(TipoEmpleadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
