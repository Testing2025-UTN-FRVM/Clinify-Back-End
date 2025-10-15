import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer | null = null;

export async function startPostgresContainer(): Promise<StartedPostgreSqlContainer> {
  if (container) {
    return container;
  }

  console.log('🐳 Iniciando contenedor PostgreSQL...');
  
  container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('clinify_test')
    .withUsername('test_user')
    .withPassword('test_password')
    .withExposedPorts(5432)
    .withReuse()
    .start();

  console.log('✅ PostgreSQL container started on port:', container.getPort());
  
  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = container.getPort().toString();
  process.env.DB_USERNAME = container.getUsername();
  process.env.DB_PASSWORD = container.getPassword();
  process.env.DB_DATABASE = container.getDatabase();
  process.env.DATABASE_URL = container.getConnectionUri();

  return container;
}

export async function stopPostgresContainer(): Promise<void> {
  if (container) {
    console.log('🛑 Deteniendo contenedor PostgreSQL...');
    await container.stop();
    container = null;
  }
}

export function getContainer(): StartedPostgreSqlContainer | null {
  return container;
}