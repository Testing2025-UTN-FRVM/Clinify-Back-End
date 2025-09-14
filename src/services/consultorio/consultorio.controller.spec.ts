import { Test, TestingModule } from '@nestjs/testing';
import { ConsultorioController } from './consultorio.controller';

describe('ConsultorioController', () => {
  let controller: ConsultorioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultorioController],
    }).compile();

    controller = module.get<ConsultorioController>(ConsultorioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
