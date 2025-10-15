import { UserEntity } from '../../src/entities/user.entity';
import { RoleEntity } from '../../src/entities/role.entity';
export class UserFactory {
  static createUserData(override: Partial<UserEntity> = {}): Partial<UserEntity> & { isActive?: boolean } {
    return {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!',
      isActive: true,
      ...override,
    };
  }

  static async createUser(
    repository: any,
    roleRepository: any,
    roleName = 'admin'
  ): Promise<UserEntity> {
    const role = await roleRepository.findOne({ where: { name: roleName } });
    
    const userData = this.createUserData();
    const user = repository.create({
      ...userData,
      roles: role ? [role] : [],
    });
    
    return repository.save(user);
  }
}