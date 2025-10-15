
import { config } from 'dotenv';
import { join } from 'path';
import { startPostgresContainer, stopPostgresContainer } from '../test/config/postgres-containers';

config({ path: join(__dirname, '..', '.env.test') });

process.env.NODE_ENV = 'test';

jest.setTimeout(60000);

beforeAll(async () => {
  await startPostgresContainer();
});

afterAll(async () => {
  await stopPostgresContainer();
});
