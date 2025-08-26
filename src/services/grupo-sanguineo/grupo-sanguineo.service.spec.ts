import { Test, TestingModule } from '@nestjs/testing';
import { GrupoSanguineoService } from './grupo-sanguineo.service';

describe('GrupoSanguineoService', () => {
  let service: GrupoSanguineoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrupoSanguineoService],
    }).compile();

    service = module.get<GrupoSanguineoService>(GrupoSanguineoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
