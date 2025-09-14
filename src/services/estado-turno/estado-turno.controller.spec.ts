import { Test, TestingModule } from '@nestjs/testing';
import { EstadoTurnoController } from './estado-turno.controller';

describe('EstadoTurnoController', () => {
  let controller: EstadoTurnoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoTurnoController],
    }).compile();

    controller = module.get<EstadoTurnoController>(EstadoTurnoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
