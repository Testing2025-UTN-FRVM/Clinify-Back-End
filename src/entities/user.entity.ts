import { UserI } from '../interfaces/JWT/user.interface';
import {
    BaseEntity, BeforeInsert, BeforeUpdate,
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import {RoleEntity} from "./role.entity";
import { hashSync } from 'bcrypt';

@Entity('users')
export class UserEntity extends BaseEntity implements UserI {
    @PrimaryGeneratedColumn()
    id: number;
    @Index({unique:true})
    @Column()
    email: string;
    @Column()
    password: string;

    @ManyToMany(() => RoleEntity, role => role.users)
    @JoinTable()
    roles: RoleEntity[];

    get permissionCodes(): string[] {
        return this.roles?.flatMap(role => role.permissions.map(permission => permission.code)) || [];
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && this.password.startsWith('$2')) {
            this.password = await hashSync(this.password, 10);
        }
    }
}