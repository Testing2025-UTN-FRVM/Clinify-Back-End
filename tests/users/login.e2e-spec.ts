import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  TypeOrmModule,
  getRepositoryToken,
  getDataSourceToken,
} from '@nestjs/typeorm';
import { newDb } from 'pg-mem';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { entities } from 'src/entities';
import { UserEntity } from 'src/entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { PermissionsService } from 'src/services/permissions/permissions.service';
import { RolesService } from 'src/services/roles/roles.service';
import { UsersController } from 'src/services/users/users.controller';
import { UsersService } from 'src/services/users/users.service';

describe('UsersController (integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let jwtService: JwtService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({
      name: 'current_database',
      returns: 'text',
      implementation: () => 'clinify_test',
    });
    db.public.registerFunction({
      name: 'version',
      returns: 'text',
      implementation: () => 'PostgreSQL 14.0',
    });

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => ({
            type: 'postgres',
            entities,
            synchronize: true,
          }),
          dataSourceFactory: async (options) => {
            const dataSource = db.adapters.createTypeormDataSource(options);
            return dataSource.initialize();
          },
        }),
        TypeOrmModule.forFeature(entities),
      ],
      controllers: [UsersController],
      providers: [UsersService, RolesService, PermissionsService, JwtService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    userRepository = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    jwtService = moduleRef.get(JwtService);
    dataSource = moduleRef.get<DataSource>(getDataSourceToken());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.createQueryBuilder().delete().execute();
  });

  it('returns tokens for valid credentials', async () => {
    const email = 'medico@example.com';
    const password = 'Fer#12345';

    await userRepository.save(
      userRepository.create({
        email,
        password,
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email, password })
      .expect(201);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    const payload = jwtService.getPayload(response.body.accessToken);
    expect(payload.email).toBe(email);
  });

  it('responds 401 for invalid password', async () => {
    const email = 'medico@example.com';

    await userRepository.save(
      userRepository.create({
        email,
        password: 'Fer#12345',
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email, password: 'incorrect' })
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      message: 'Unauthorized',
    });
  });
});
