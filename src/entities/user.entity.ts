import { UserI } from '../interfaces/JWT/user.interface';
import {
    BaseEntity, BeforeInsert, BeforeUpdate,
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany, OneToMany, OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {RoleEntity} from "./role.entity";
import { hashSync } from 'bcrypt';
import {EmpleadoEntity} from "./empleado.entity";

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

    @OneToOne(() => EmpleadoEntity, (empleado) => empleado.user)
    empleado: EmpleadoEntity;

    get permissionCodes(): string[] {
        return this.roles?.flatMap(role => role.permissions.map(permission => permission.code)) || [];
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            this.password = await hashSync(this.password, 10);
        }
    }
}