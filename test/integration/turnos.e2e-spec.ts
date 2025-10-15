import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseHelper } from '../helpers/database.helper';
import { UserFactory } from '../factories/user.factory';
import { PersonaFactory } from '../factories/persona.factory';
import { PacienteFactory } from '../factories/paciente.factory';
import { UserEntity } from '../../src/entities/user.entity';
import { RoleEntity } from '../../src/entities/role.entity';
import { PersonaEntity } from '../../src/entities/persona.entity';
import { PacienteEntity } from '../../src/entities/paciente.entity';

describe('Turnos (e2e)', () => {
  let app: INestApplication;
  let dbHelper: DatabaseHelper;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dbHelper = new DatabaseHelper(app);
  });

  beforeEach(async () => {
    await dbHelper.cleanDatabase();
    await dbHelper.seedRolesAndPermissions();

    const userRepository = await dbHelper.getRepository(UserEntity);
    const roleRepository = await dbHelper.getRepository(RoleEntity);
    const user = await UserFactory.createUser(userRepository, roleRepository);

    const loginRes = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: user.email, password: 'Test123!' });

    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /turno', () => {
    it('debe crear un turno', async () => {
      const personaRepo = await dbHelper.getRepository(PersonaEntity);
      const pacienteRepo = await dbHelper.getRepository(PacienteEntity);

      const persona = await PersonaFactory.createPersona(personaRepo);
      const paciente = await PacienteFactory.createPaciente(pacienteRepo, persona);

      const turnoData = {
        pacienteId: paciente.id,
        fecha: '2025-12-01',
        hora: '10:00',
        motivo: 'Consulta general',
      };

      const res = await request(app.getHttpServer())
        .post('/turno')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.motivo).toBe('Consulta general');
    });
  });

  describe('GET /turno', () => {
    it('debe listar turnos', async () => {
      const res = await request(app.getHttpServer())
        .get('/turno')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});