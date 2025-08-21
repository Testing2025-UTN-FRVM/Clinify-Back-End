import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import { AuthGuard } from '../../middlewares/auth.middleware';
import {UsersService} from "./users.service";
import * as requestUser from 'src/interfaces/JWT/request-user';
import {LoginDTO} from "../../interfaces/login.dto";
import {RegisterDTO} from "../../interfaces/register.dto";

@Controller('users')
export class UsersController {
    constructor(private service: UsersService) {
    }

    @UseGuards(AuthGuard)
    @Get('me')
    me(@Req() req: requestUser.RequestWithUser) {
        return {email: req.user?.email}
    }

    @Post('login')
    login(@Body() body: LoginDTO) {
        return this.service.login(body);
    }

    @Post('register')
    register(@Body() body: RegisterDTO) {
        return this.service.register(body);
    }

    @Get('refresh-token')
    refreshToken(@Req() request: Request) {
        return this.service.refreshToken(
            request.headers['refresh-token'] as string,
        );
    }

}
