import { PacienteEntity } from '../../src/entities/paciente.entity';
import { PersonaEntity } from '../../src/entities/persona.entity';
import { GrupoSanguineoEntity } from '../../src/entities/grupoSanguineo.entity';

export class PacienteFactory {
  static async createPaciente(
    repository: any,
    persona: PersonaEntity,
    grupoSanguineo?: GrupoSanguineoEntity,
  ): Promise<PacienteEntity> {
    const paciente = repository.create({
      persona,
      grupoSanguineo,
    });
    return repository.save(paciente);
  }
    static async createPersona(
    repository: any,
    override: Partial<PersonaEntity> = {}
  ): Promise<PersonaEntity> {
    const personaData = this.createPersona(override);
    const persona = repository.create(personaData);
    return repository.save(persona);
  }
}