import { Test, TestingModule } from '@nestjs/testing';
import { HistoriaClinicaController } from './historia-clinica.controller';

describe('HistoriaClinicaController', () => {
  let controller: HistoriaClinicaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoriaClinicaController],
    }).compile();

    controller = module.get<HistoriaClinicaController>(HistoriaClinicaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
