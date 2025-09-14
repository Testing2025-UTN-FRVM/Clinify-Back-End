import { Test, TestingModule } from '@nestjs/testing';
import { GrupoSanguineoController } from './grupo-sanguineo.controller';

describe('GrupoSanguineoController', () => {
  let controller: GrupoSanguineoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrupoSanguineoController],
    }).compile();

    controller = module.get<GrupoSanguineoController>(GrupoSanguineoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
