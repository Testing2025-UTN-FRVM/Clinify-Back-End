import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';

export class DatabaseHelper {
  private dataSource: DataSource;

  constructor(app: INestApplication) {
    this.dataSource = app.get(DataSource);
  }

  async cleanDatabase(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    
    await this.dataSource.query('SET session_replication_role = replica;');

    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
    }

    await this.dataSource.query('SET session_replication_role = DEFAULT;');
  }

  async seedRolesAndPermissions(): Promise<void> {
    await this.dataSource.query(`
      INSERT INTO permissions (name, description, created_at, updated_at)
      VALUES 
        ('crear_paciente', 'Crear pacientes', NOW(), NOW()),
        ('editar_paciente', 'Editar pacientes', NOW(), NOW()),
        ('ver_paciente', 'Ver pacientes', NOW(), NOW()),
        ('crear_turno', 'Crear turnos', NOW(), NOW()),
        ('ver_turno', 'Ver turnos', NOW(), NOW()),
        ('gestionar_empleados', 'Gestionar empleados', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `);

    await this.dataSource.query(`
      INSERT INTO roles (name, description, created_at, updated_at)
      VALUES 
        ('admin', 'Administrador del sistema', NOW(), NOW()),
        ('medico', 'Médico profesional', NOW(), NOW()),
        ('recepcionista', 'Recepcionista', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `);

    await this.dataSource.query(`
      INSERT INTO roles_permissions (role_id, permission_id)
      SELECT r.id, p.id 
      FROM roles r, permissions p 
      WHERE r.name = 'admin'
      ON CONFLICT DO NOTHING;
    `);
  }

  async getRepository<T>(entity: new () => T) {
    return this.dataSource.getRepository(entity);
  }

  async closeConnection(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
 
 
  }
}