import { Test, TestingModule } from '@nestjs/testing';
import { ConsultorioService } from './consultorio.service';

describe('ConsultorioService', () => {
  let service: ConsultorioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsultorioService],
    }).compile();

    service = module.get<ConsultorioService>(ConsultorioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
