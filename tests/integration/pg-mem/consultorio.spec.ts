import {Test, TestingModule} from "@nestjs/testing";
import {ConsultorioService} from "src/services/consultorio/consultorio.service";
import {DataSource, Repository} from "typeorm";
import {ConsultorioEntity} from "src/entities/consultorio.entity";
import {IBackup, IMemoryDb, newDb} from "pg-mem";
import {entities} from "src/entities";
import {getRepositoryToken} from "@nestjs/typeorm";
import {CreateConsultorioDTO} from "src/interfaces/create/create-consultorio.dto";
import {PatchConsultorioDTO} from "src/interfaces/patch/patch-consultorio.dto";
import {NotFoundException} from "@nestjs/common";

describe('Pg-mem - Consultorios (integracion)', ()=> {
    let moduleRef: TestingModule;
    let service: ConsultorioService;
    let consultorioRepository: Repository<ConsultorioEntity>;
    let dataSource: DataSource;
    let db: IMemoryDb;
    let backup: IBackup;

    beforeAll(async () => {
        db = newDb();

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
            imports: [],
            providers: [
                ConsultorioService,
                {
                    provide: getRepositoryToken(ConsultorioEntity),
                    useValue: dataSource.getRepository(ConsultorioEntity)
                },
                {
                    provide: DataSource,
                    useValue: dataSource
                },
            ]
        }).compile();

        service = moduleRef.get(ConsultorioService);
        consultorioRepository = moduleRef.get(getRepositoryToken(ConsultorioEntity));
        backup = db.backup();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        backup.restore();
    })

    it('Debe crear un nuevo consultorio y luego buscarlo en la BD', async () => {
        const dto: CreateConsultorioDTO = {
            numero: 101,
            observaciones: "N/A"
        };
        const consultorio = await service.create(dto)

        expect(consultorio).toMatchObject({
            id: expect.any(Number),
            ...dto
        });

        const consultorioGuardado = await consultorioRepository.findOneBy({id: consultorio.id})
        expect(consultorioGuardado).toBeDefined();
        expect(consultorioGuardado?.numero).toBe(dto.numero);
    });

    it('Debe actualizar correctamente un consultorio existente', async () => {
        const dto: CreateConsultorioDTO = {
            numero: 101,
            observaciones: "N/A"
        };

        const actualizacion: PatchConsultorioDTO = {
            observaciones: "Tiene ecógrafo"
        }

        const consultorio = await service.create(dto);
        expect(consultorio).toBeDefined()

        await service.edit(consultorio.id, actualizacion)
        expect( await consultorioRepository.findOneBy({id: consultorio.id})
            .then(consultorio => consultorio?.observaciones))
            .toBe(actualizacion.observaciones)
    });

    it('Debe eliminar un consultorio existente', async () => {
        const dto: CreateConsultorioDTO = {
            numero: 101,
            observaciones: "N/A"
        };
        const consultorio = await service.create(dto)

        const consultorioEliminado = await service.delete(consultorio.id);
        expect(consultorioEliminado).toBeDefined()
        expect(consultorioEliminado).toMatchObject({message: expect.any(String)})
    });

    it('Debe lanzar NotFoundException al buscar un consultorio inexistente', async () => {
        const id = 105
        await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException)
    })
})