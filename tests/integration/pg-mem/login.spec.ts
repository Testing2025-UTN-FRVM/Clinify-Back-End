import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IBackup, IMemoryDb, newDb } from 'pg-mem';
import { DataSource, Repository } from 'typeorm';
import { entities } from 'src/entities';
import { PermissionEntity } from 'src/entities/permission.entity';
import { RoleEntity } from 'src/entities/role.entity';
import { UserEntity } from 'src/entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { PermissionsService } from 'src/services/permissions/permissions.service';
import { RolesService } from 'src/services/roles/roles.service';
import { UsersService } from 'src/services/users/users.service';

describe('Pg-Mem - UsersService (integration)', () => {
    let moduleRef: TestingModule;
    let usersService: UsersService;
    let rolesService: RolesService;
    let permissionsService: PermissionsService;
    let userRepository: Repository<UserEntity>;
    let dataSource: DataSource;
    let db: IMemoryDb;
    let backup: IBackup;

    const jwtServiceMock = {
        refreshToken: jest.fn(),
        generateToken: jest.fn(),
        getPayload: jest.fn(),
    };

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
                UsersService,
                RolesService,
                PermissionsService,
                {
                    provide: JwtService,
                    useValue: jwtServiceMock,
                },
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: dataSource.getRepository(UserEntity),
                },
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
                },
            ],
        }).compile();

        usersService = moduleRef.get(UsersService);
        rolesService = moduleRef.get(RolesService);
        permissionsService = moduleRef.get(PermissionsService);
        userRepository = moduleRef.get(getRepositoryToken(UserEntity));
        backup = db.backup();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        backup.restore();
    });

    it('Registra a un nuevo usuario y guarda su contraseña hasheada', async () => {
        const user = await usersService.register('alice@example.com', 'P@ssword123');

        expect(user.email).toBe('alice@example.com');

        const stored = await userRepository.findOneBy({ email: 'alice@example.com' });
        expect(stored).toBeDefined();
        expect(stored?.password).toMatch(/^\$2[aby]\$.+/);
        expect(stored?.password).not.toBe('P@ssword123');
    });

    it('Loguea a un usuario con credenciales válidas y devuelve los tokens de acceso JWT', async () => {
        await usersService.register('bob@example.com', 'Secret123');

        jwtServiceMock.generateToken.mockImplementation((_payload: any, type: string) => `${type}-token`);

        const tokens = await usersService.login({ email: 'bob@example.com', password: 'Secret123' });

        expect(tokens).toEqual({
            accessToken: 'auth-token',
            refreshToken: 'refresh-token',
        });
        expect(jwtServiceMock.generateToken).toHaveBeenNthCalledWith(1, { email: 'bob@example.com' }, 'auth');
        expect(jwtServiceMock.generateToken).toHaveBeenNthCalledWith(2, { email: 'bob@example.com' }, 'refresh');
    });

    it('Lanza UnauthorizedException cuando la contraseña es invalida', async () => {
        await usersService.register('carol@example.com', 'CorrectHorseBatteryStaple');

        await expect(
            usersService.login({ email: 'carol@example.com', password: 'WrongPassword' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('Asigna roles a un usuario', async () => {
        await usersService.register('dave@example.com', 'Secret123');
        const user = await userRepository.findOne({ where: { email: 'dave@example.com' } });
        expect(user).toBeDefined();

        const permission = await permissionsService.create({ code: 'USERS_ASSIGN' });
        const role = await rolesService.create({ name: 'manager' });
        await rolesService.assignPermissions(role.id, { permissionCodes: [permission.id] } as any);

        const updated = await usersService.assignRoles(user!.id, { roleIds: [role.id] });

        expect(updated.roles).toHaveLength(1);
        expect(updated.roles[0].name).toBe('manager');

        const canDo = await usersService.canDo(updated, 'USERS_ASSIGN');
        expect(canDo).toBe(true);
    });

    it('delega la generacion de nuevas credenciales de acceso a jwtService', async () => {
        jwtServiceMock.refreshToken.mockReturnValue({
            accessToken: 'next-access',
            refreshToken: 'next-refresh',
        });

        await expect(usersService.refreshToken('refresh-token')).resolves.toEqual({
            accessToken: 'next-access',
            refreshToken: 'next-refresh',
        });
        expect(jwtServiceMock.refreshToken).toHaveBeenCalledWith('refresh-token');
    });
});
