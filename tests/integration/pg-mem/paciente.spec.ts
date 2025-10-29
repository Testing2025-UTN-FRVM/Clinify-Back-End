import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PacienteService } from 'src/services/paciente/paciente.service';
import { GrupoSanguineoService } from 'src/services/grupo-sanguineo/grupo-sanguineo.service';
import { PersonaService } from 'src/services/persona/persona.service';
import { PacienteEntity } from 'src/entities/paciente.entity';
import { GrupoSanguineoEntity } from 'src/entities/grupoSanguineo.entity';
import { PersonaEntity } from 'src/entities/persona.entity';
import { entities } from 'src/entities';
import { RegistrarPacienteDTO } from 'src/interfaces/register.dto';
import { PatchPacienteDTO } from 'src/interfaces/patch.dto';
import { NotFoundException } from '@nestjs/common';
import {IBackup, IMemoryDb, newDb} from "pg-mem";

describe('Pg-mem - PacienteService (integracion)', () => {
    let moduleRef: TestingModule;
    let pacienteService: PacienteService;
    let grupoSanguineoService: GrupoSanguineoService;
    let pacienteRepository: Repository<PacienteEntity>;
    let dataSource: DataSource;
    let db: IMemoryDb
    let backup: IBackup

    const buildPacienteDto = (grupoSanguineoId: number, overrides: Partial<RegistrarPacienteDTO> = {}): RegistrarPacienteDTO => ({
        nombre: 'Ana',
        apellido: 'Gonzalez',
        fechaNacimiento: new Date('1992-01-01T00:00:00.000Z'),
        tipoDocumento: 'DNI',
        nroDocumento: '10000000',
        telefono: '123456789',
        altura: 165,
        peso: 60,
        observaciones: 'Paciente sin antecedentes',
        idGrupoSanguineo: grupoSanguineoId,
        ...overrides,
    });

    beforeAll(async () => {
        db = newDb()

        db.public.registerFunction({
            name: 'current_database',
            implementation: () => 'users_test',
        });

        db.public.registerFunction({
            name: 'version',
            implementation: () => 'PostgreSQL 17.6',
        });

        dataSource = await db.adapters.createTypeormDataSource({
            type: 'postgres',
            entities: [...entities],
            synchronize: true,
        });

        await dataSource.initialize();

        moduleRef = await Test.createTestingModule({
            providers: [
                PacienteService,
                GrupoSanguineoService,
                PersonaService,
                {
                    provide: getRepositoryToken(PacienteEntity),
                    useValue: dataSource.getRepository(PacienteEntity),
                },
                {
                    provide: getRepositoryToken(GrupoSanguineoEntity),
                    useValue: dataSource.getRepository(GrupoSanguineoEntity),
                },
                {
                    provide: getRepositoryToken(PersonaEntity),
                    useValue: dataSource.getRepository(PersonaEntity),
                },
                {
                    provide: DataSource,
                    useValue: dataSource,
                },
            ],
        }).compile();

        pacienteService = moduleRef.get(PacienteService);
        grupoSanguineoService = moduleRef.get(GrupoSanguineoService);
        pacienteRepository = moduleRef.get(getRepositoryToken(PacienteEntity));
        backup = db.backup();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        backup.restore();
    });

    it('Debe crear un paciente junto con su persona y grupo sanguineo relacionados', async () => {
        const grupo = await grupoSanguineoService.create({ nombre: 'O+' });
        const dto = buildPacienteDto(grupo.id, { nroDocumento: '20000000' });

        const paciente = await pacienteService.create(dto);

        expect(paciente).toMatchObject({
            id: expect.any(Number),
            altura: dto.altura,
            peso: dto.peso,
            observaciones: dto.observaciones,
            persona: expect.objectContaining({
                nombre: dto.nombre,
                apellido: dto.apellido,
                numeroDocumento: dto.nroDocumento,
            }),
            grupoSanguineo: expect.objectContaining({
                id: grupo.id,
                nombre: 'O+',
            }),
        });

        const stored = await pacienteRepository.findOne({
            where: { id: paciente.id },
            relations: ['persona', 'grupoSanguineo'],
        });

        expect(stored).toBeDefined();
        expect(stored?.persona.nombre).toBe(dto.nombre);
        expect(stored?.grupoSanguineo.nombre).toBe('O+');
    });

    it('Debe actualizar los datos del paciente y su grupo sanguineo', async () => {
        const grupoInicial = await grupoSanguineoService.create({ nombre: 'A+' });
        const dto = buildPacienteDto(grupoInicial.id, { nroDocumento: '30000000' });
        const paciente = await pacienteService.create(dto);

        const nuevoGrupo = await grupoSanguineoService.create({ nombre: 'B-' });
        const cambios: PatchPacienteDTO = {
            peso: 72,
            observaciones: 'Paciente con controles recientes',
            idGrupoSanguineo: nuevoGrupo.id,
        };

        const actualizado = await pacienteService.edit(paciente.id, cambios);

        expect(actualizado.peso).toBe(72);
        expect(actualizado.observaciones).toBe('Paciente con controles recientes');
        expect(actualizado.grupoSanguineo.nombre).toBe('B-');
    });

    it('Debe devolver todos los pacientes almacenados', async () => {
        const grupo = await grupoSanguineoService.create({ nombre: 'AB+' });

        await pacienteService.create(buildPacienteDto(grupo.id, { nroDocumento: '40000000', nombre: 'Carla' }));
        await pacienteService.create(buildPacienteDto(grupo.id, { nroDocumento: '50000000', nombre: 'Diego' }));

        const pacientes = await pacienteService.findAll();

        expect(pacientes).toHaveLength(2);
        expect(pacientes.map(p => p.persona.nombre)).toEqual(
            expect.arrayContaining(['Carla', 'Diego']),
        );
    });

    it('Debe lanzar NotFoundException cuando el paciente no existe', async () => {
        await expect(pacienteService.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
    });
});
