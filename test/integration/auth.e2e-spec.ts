import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseHelper } from '../helpers/database.helper';
import { UserFactory } from '../factories/user.factory';
import { UserEntity } from '../../src/entities/user.entity';
import { RoleEntity } from '../../src/entities/role.entity';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let dbHelper: DatabaseHelper;
  let userRepository: any;
  let roleRepository: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dbHelper = new DatabaseHelper(app);
    userRepository = await dbHelper.getRepository(UserEntity);
    roleRepository = await dbHelper.getRepository(RoleEntity);
  });

  beforeEach(async () => {
    await dbHelper.cleanDatabase();
    await dbHelper.seedRolesAndPermissions();
  });

  afterAll(async () => {
    await dbHelper.closeConnection();
    await app.close();
  });

  describe('POST /users/register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        email: 'nuevo@example.com',
        password: 'Password123!',
      };

      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(userData.email);
      expect(res.body).not.toHaveProperty('password');
    });

    it('debe fallar con email duplicado', async () => {
      await UserFactory.createUser(userRepository, roleRepository);
      const existingUser = await userRepository.findOne({ where: {} });

      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: existingUser.email,
          password: 'Password123!',
        })
        .expect(400);

      expect(res.body.message).toContain('email');
    });
  });

  describe('POST /users/login', () => {
    it('debe autenticar usuario con credenciales correctas', async () => {
      const password = 'Password123!';
      const user = await UserFactory.createUser(userRepository, roleRepository);
      
      await userRepository.update(user.id, { password });

      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: user.email,
          password,
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(user.email);
    });
  });
});