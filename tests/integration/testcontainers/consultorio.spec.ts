import {Test, TestingModule} from "@nestjs/testing";
import {ConsultorioService} from "src/services/consultorio/consultorio.service";
import {DataSource, Repository} from "typeorm";
import {ConsultorioEntity} from "src/entities/consultorio.entity";
import {entities} from "src/entities";
import {getRepositoryToken} from "@nestjs/typeorm";
import {CreateConsultorioDTO} from "src/interfaces/create/create-consultorio.dto";
import {PatchConsultorioDTO} from "src/interfaces/patch/patch-consultorio.dto";
import {NotFoundException} from "@nestjs/common";
import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";

describe('Testcontainers - Consultorios (integracion)', ()=> {
    let moduleRef: TestingModule;
    let service: ConsultorioService;
    let consultorioRepository: Repository<ConsultorioEntity>;
    let dataSource: DataSource;
    let container: StartedPostgreSqlContainer;

    jest.setTimeout(60000);

    beforeAll(async () => {
        console.log("Inicializando base de datos")
        container = await new PostgreSqlContainer('postgres:17.6').start()
        console.log('Base de datos inicializada')

        dataSource = new DataSource({
            type: 'postgres',
            host: container.getHost(),
            port: container.getPort(),
            username: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
            entities: [...entities],
            synchronize: true
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
    });

    afterAll(async () => {
        await dataSource.destroy();
        await container.stop();
    });

    beforeEach(async () => {
        await dataSource.synchronize(true)
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