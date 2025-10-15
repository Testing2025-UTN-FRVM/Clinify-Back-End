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
import { GrupoSanguineoEntity } from '../../src/entities/grupoSanguineo.entity';

describe('Pacientes (e2e)', () => {
  let app: INestApplication;
  let dbHelper: DatabaseHelper;
  let authToken: string;
  let personaRepository: any;
  let pacienteRepository: any;
  let grupoSanguineoRepository: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dbHelper = new DatabaseHelper(app);
    personaRepository = await dbHelper.getRepository(PersonaEntity);
    pacienteRepository = await dbHelper.getRepository(PacienteEntity);
    grupoSanguineoRepository = await dbHelper.getRepository(GrupoSanguineoEntity);
  });

  beforeEach(async () => {
    await dbHelper.cleanDatabase();
    await dbHelper.seedRolesAndPermissions();

    // Crear usuario y obtener token
    const userRepository = await dbHelper.getRepository(UserEntity);
    const roleRepository = await dbHelper.getRepository(RoleEntity);
    const user = await UserFactory.createUser(userRepository, roleRepository);

    const loginRes = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: user.email,
        password: 'Test123!',
      });

    authToken = loginRes.body.token;

    // Crear grupos sanguíneos
    await grupoSanguineoRepository.save([
      { tipo: 'A+' },
      { tipo: 'B+' },
      { tipo: 'O+' },
      { tipo: 'AB+' },
    ]);
  });

  afterAll(async () => {
    await dbHelper.closeConnection();
    await app.close();
  });

  describe('POST /paciente', () => {
    it('debe crear un paciente con persona nueva', async () => {
      const grupoSanguineo = await grupoSanguineoRepository.findOne({ where: { tipo: 'A+' } });
      
      const pacienteData = {
        persona: {
          nombre: 'Carlos',
          apellido: 'González',
          nroDocumento: '12345678',
          tipoDocumento: 'DNI',
          fechaNacimiento: '1985-05-15',
          telefono: '1122334455',
          direccion: 'Av. Siempre Viva 742',
        },
        grupoSanguineoId: grupoSanguineo.id,
      };

      const res = await request(app.getHttpServer())
        .post('/paciente')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pacienteData)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.persona.nombre).toBe('Carlos');
    });
  });

  describe('GET /paciente', () => {
    it('debe listar todos los pacientes', async () => {
      for (let i = 0; i < 3; i++) {
        const persona = await PersonaFactory.createPersona(personaRepository, {
          numeroDocumento: `doc${i}${Date.now()}`,
        });
        await PacienteFactory.createPaciente(pacienteRepository, persona);
      }

      const res = await request(app.getHttpServer())
        .get('/paciente')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });
  });
});
