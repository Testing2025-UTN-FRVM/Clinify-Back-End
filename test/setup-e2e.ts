import { config } from 'dotenv';
// Cargar .env.test antes de iniciar el módulo
config({ path: '.env.test' });

jest.setTimeout(30000);
