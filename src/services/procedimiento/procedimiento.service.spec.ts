import { Test, TestingModule } from '@nestjs/testing';
import { ProcedimientoService } from './procedimiento.service';

describe('ProcedimientoService', () => {
  let service: ProcedimientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcedimientoService],
    }).compile();

    service = module.get<ProcedimientoService>(ProcedimientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
