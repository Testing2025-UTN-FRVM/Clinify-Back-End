import { Test, TestingModule } from '@nestjs/testing';
import { ProcedimientoController } from './procedimiento.controller';

describe('ProcedimientoController', () => {
  let controller: ProcedimientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcedimientoController],
    }).compile();

    controller = module.get<ProcedimientoController>(ProcedimientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
