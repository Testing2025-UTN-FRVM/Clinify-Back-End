import {HttpException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "src/entities/user.entity";
import {Repository, EntityManager} from "typeorm";
import { compareSync } from 'bcrypt';
import {JwtService} from "src/jwt/jwt.service";
import {UserI} from "src/interfaces/JWT/user.interface";
import {LoginDTO} from "src/interfaces/login.dto";
import {RolesService} from "src/services/roles/roles.service";
import {AssignRoleDTO} from "src/interfaces/assign.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly rolesService: RolesService,

    ) {}

    async refreshToken(refreshToken: string) {
        return this.jwtService.refreshToken(refreshToken);
    }

    async canDo(user: UserI, permission: string): Promise<boolean> {
        const result = user.permissionCodes.includes(permission);
        if (!result) {
            throw new UnauthorizedException();
        }
        return true;
    }

    async register(email: string, password: string, manager?:EntityManager): Promise<UserEntity> {
        try {
            const repo=manager? manager.getRepository(UserEntity): this.userRepository
            const user =repo.create({email, password});
            await repo.save(user);
            return user;
        }catch (error) {
            throw new HttpException(error.message, 500);
        }
    }

    async login(body: LoginDTO) {
        const user = await this.findByEmail(body.email);
        if (user == null) {
            throw new UnauthorizedException();
        }
        const compareResult = compareSync(body.password, user.password);
        if (!compareResult) {
            throw new UnauthorizedException();
        }
        return {
            accessToken: this.jwtService.generateToken({ email: user.email }, 'auth'),
            refreshToken: this.jwtService.generateToken(
                { email: user.email },
                'refresh',
            )
        };
    }

    async findByEmail(email: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { email }, relations: ["roles","roles.permissions"] });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async assignRoles(id: number, assignRoleDto: AssignRoleDTO): Promise<UserEntity> {
        const user = await this.findById(id);

        const roles= await  Promise.all(assignRoleDto.roleIds.map((roleId)=> this.rolesService.findOne(roleId)));

        if(!user.roles) {
            user.roles = roles;
        } else {
            user.roles= [...user.roles, ...roles];
        }

        return await this.userRepository.save(user);
    }

    async removeRole(id:number, roleId:number): Promise<{message: string}> {
        const user = await this.findById(id);

        await this.rolesService.findOne(roleId);

        user.roles = user.roles.filter(role => role.id !== roleId);

        await this.userRepository.save(user);

        return {message: 'Rol eliminado'};
    }

    private async findById(id: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({where: {id}, relations: ["roles","roles.permissions"], select: ["id", "email", "roles"]});
        if(!user) {
            throw new NotFoundException('El usuario no existe');
        }
        return user;
    }


}
