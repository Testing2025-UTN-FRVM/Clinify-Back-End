import { Test, TestingModule } from '@nestjs/testing';
import { TipoEmpleadoController } from './tipo-empleado.controller';

describe('TipoEmpleadoController', () => {
  let controller: TipoEmpleadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoEmpleadoController],
    }).compile();

    controller = module.get<TipoEmpleadoController>(TipoEmpleadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
