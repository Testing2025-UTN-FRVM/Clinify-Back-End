import { Test, TestingModule } from '@nestjs/testing';
import { PersonaController } from './persona.controller';
import { PersonaService } from './persona.service';
import { PersonaEntity } from 'src/entities/persona.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';

describe('PersonaController', () => {
  let controller: PersonaController;
  let service: jest.Mocked<PersonaService>;

  const mockService = () => ({
    edit: jest.fn(),
  });

  beforeEach(async () => {
    const guard = { canActivate: jest.fn().mockResolvedValue(true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonaController],
      providers: [
        {
          provide: PersonaService,
          useValue: mockService(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(guard)
      .compile();

    controller = module.get(PersonaController);
    service = module.get(PersonaService);
  });

  it('should edit persona data', async () => {
    const dto = { nombre: 'John' } as any;
    const expected = { id: 1 } as PersonaEntity;
    service.edit.mockResolvedValue(expected);

    await expect(controller.edit(1, dto)).resolves.toBe(expected);
    expect(service.edit).toHaveBeenCalledWith(1, dto);
  });
});
