import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RolesService } from 'src/services/roles/roles.service';
import { PermissionsService } from 'src/services/permissions/permissions.service';
import { RoleEntity } from 'src/entities/role.entity';
import { PermissionEntity } from 'src/entities/permission.entity';
import { entities } from 'src/entities';
import {NotFoundException} from "@nestjs/common";
import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {CreatePermissionDTO} from "src/interfaces/create/create-permission.dto";

describe('Testcontainers - RolesService (integracion)', () => {
    let moduleRef: TestingModule;
    let service: RolesService;
    let permissionsService: PermissionsService;
    let permissionsRepository: Repository<PermissionEntity>;
    let roleRepository: Repository<RoleEntity>;
    let dataSource: DataSource;
    let container: StartedPostgreSqlContainer;

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
                RolesService, PermissionsService,
                {
                    provide: getRepositoryToken(RoleEntity),
                    useValue: dataSource.getRepository(RoleEntity),
                },
                {
                    provide: getRepositoryToken(PermissionEntity),
                    useValue: dataSource.getRepository(PermissionEntity),
                },
                {
                    provide: DataSource,
                    useValue: dataSource,
                }
            ],
        }).compile();

        service = moduleRef.get(RolesService);
        permissionsService = moduleRef.get(PermissionsService);
        roleRepository = moduleRef.get(getRepositoryToken(RoleEntity));
        permissionsRepository = moduleRef.get(getRepositoryToken(PermissionEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
        await container.stop()
    });

    beforeEach(async () => {
        await dataSource.synchronize(true)
    });

    it('Debe crear y guardar un rol con el nombre dado', async () => {
        const role = await service.create({ name: 'admin' });

        expect(role).toMatchObject({
            id: expect.any(Number),
            name: 'admin',
        });

        const stored = await roleRepository.findOneBy({ id: role.id });
        expect(stored).toBeDefined();
        expect(stored?.name).toBe('admin');
    });

    it('Debe asignar permisos a un rol existente', async () => {
        const createPermission = async (code: CreatePermissionDTO) =>
            permissionsService.create(code);

        const read = await createPermission({code: 'PERMISSIONS_READ'});
        const write = await createPermission({code: 'PERMISSIONS_WRITE'});
        const role = await service.create({ name: 'editor' });

        const updated = await service.assignPermissions(role.id, { permissionCodes: [read.id, write.id] });

        expect(
            updated.permissions
                .map(permission => permission.code)
                .sort((a, b) => a.localeCompare(b))
        ).toEqual([
            'PERMISSIONS_READ',
            'PERMISSIONS_WRITE',
        ]);

        const stored = await roleRepository.findOne({
            where: { id: role.id },
            relations: ['permissions'],
        });
        expect(stored?.permissions).toHaveLength(2);
    });

    it('Debe eliminar correctamente un rol', async () => {
        const role = await service.create({ name: 'temp-role' });

        const response = await service.delete(role.id);
        expect(response).toMatchObject({ message: expect.any(String) });

        const exists = await roleRepository.findOneBy({ id: role.id });
        expect(exists).toBeNull();
    });

    it('Debe lanzar NotFoundException al buscar un consultorio inexistente', async () => {
        const id = 105
        await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException)
    });
});