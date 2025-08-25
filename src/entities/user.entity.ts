import { UserI } from '../interfaces/JWT/user.interface';
import {
    BaseEntity, BeforeInsert, BeforeUpdate,
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany, OneToOne,
    PrimaryGeneratedColumn, Unique
} from 'typeorm';
import {RoleEntity} from "./role.entity";
import { hashSync } from 'bcrypt';
import {EmpleadoEntity} from "./empleado.entity";

@Unique('UQ_users_email',['email'])

@Entity('users')
export class UserEntity extends BaseEntity implements UserI {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @ManyToMany(() => RoleEntity, role => role.users)
    @JoinTable()
    roles: RoleEntity[];

    @OneToOne(() => EmpleadoEntity, (empleado) => empleado.user)
    empleado: EmpleadoEntity;

    get permissionCodes(): string[] {
        return this.roles?.flatMap(role => role.permissions.map(permission => permission.code)) || [];
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2')) {
            this.password = await hashSync(this.password, 10);
        }
    }
}