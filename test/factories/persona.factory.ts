import { PersonaEntity } from '../../src/entities/persona.entity';

export class PersonaFactory {
  static createPersonaData(override: Partial<PersonaEntity> = {}): Partial<PersonaEntity> {
    const timestamp = Date.now();
    return {
      nombre: 'Juan',
      apellido: 'Pérez',
      numeroDocumento: `${timestamp}`,
      tipoDocumento: 'DNI',
      fechaNacimiento: new Date('1990-01-01'),
      telefono: '1234567890',
      ...override,
    };
  }

  static async createPersona(
    repository: any,
    override: Partial<PersonaEntity> = {}
  ): Promise<PersonaEntity> {
    const personaData = this.createPersonaData(override);
    const persona = repository.create(personaData);
    return repository.save(persona);
  }
}