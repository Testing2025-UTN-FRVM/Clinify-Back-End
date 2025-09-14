
import { Test, TestingModule } from '@nestjs/testing';
import { ProcedimientoController } from './procedimiento.controller';
import { ProcedimientoService } from './procedimiento.service';
import { CreateProcedimientoDTO } from 'src/interfaces/create/create-procedimiento.dto';
import { PatchProcedimientoDTO } from 'src/interfaces/patch/patch-procedimiento.dto';
import { ProcedimientoEntity } from 'src/entities/procedimiento.entity';

describe('ProcedimientoController', () => {
  let controller: ProcedimientoController;
  let service: ProcedimientoService;

  const procedimientoMock: ProcedimientoEntity = {
    id: 1,
    nombre: 'Proc1',
    descripcion: 'Desc1',
    duracion: 30,
    turnos: [],
    doctores: [],
  };

  const serviceMock = {
    create: jest.fn().mockResolvedValue(procedimientoMock),
    findAll: jest.fn().mockResolvedValue([procedimientoMock]),
    findOne: jest.fn().mockResolvedValue(procedimientoMock),
    patch: jest.fn().mockResolvedValue({ ...procedimientoMock, descripcion: 'Modificado' }),
    delete: jest.fn().mockResolvedValue({ message: `Procedimiento: ${procedimientoMock.nombre} eliminado correctamente` }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcedimientoController],
      providers: [
        {
          provide: ProcedimientoService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ProcedimientoController>(ProcedimientoController);
    service = module.get<ProcedimientoService>(ProcedimientoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a procedimiento', async () => {
    const dto: CreateProcedimientoDTO = { nombre: 'Proc1', descripcion: 'Desc1', duracion: 30 };
    const result = await controller.createProcedimiento(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(procedimientoMock);
  });

  it('should return all procedimientos', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([procedimientoMock]);
  });

  it('should return one procedimiento by id', async () => {
    const result = await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(procedimientoMock);
  });

  it('should patch a procedimiento', async () => {
    const patchDto: PatchProcedimientoDTO = { descripcion: 'Modificado' };
    const result = await controller.patch(1, patchDto);
    expect(service.patch).toHaveBeenCalledWith(1, patchDto);
    expect(result).toEqual({ ...procedimientoMock, descripcion: 'Modificado' });
  });

  it('should delete a procedimiento', async () => {
    const result = await controller.delete(1);
    expect(service.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: `Procedimiento: ${procedimientoMock.nombre} eliminado correctamente` });
  });
});
