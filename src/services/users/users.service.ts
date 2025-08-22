import {HttpException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../../entities/user.entity";
import {Repository} from "typeorm";
import { hashSync, compareSync } from 'bcrypt';
import {JwtService} from "../../jwt/jwt.service";
import {UserI} from "../../interfaces/JWT/user.interface";
import {LoginDTO} from "../../interfaces/login.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private jwtService: JwtService
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

    // async register(body: RegisterDTO): Promise<{status: string}> {
    //     try {
    //         const user = new UserEntity();
    //         Object.assign(user, body);
    //         user.password = hashSync(user.password, 10);
    //         await this.userRepository.save(user);
    //         return {status: "created"};
    //     }catch (error) {
    //         throw new HttpException(error.message, 500);
    //     }
    // }

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

}
