import {Body, Controller, Delete, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import { AuthGuard } from "src/middlewares/auth.middleware";
import {UsersService} from "./users.service";
import * as requestUser from 'src/interfaces/JWT/request-user';
import {LoginDTO} from "src/interfaces/login.dto";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {AssignRoleDTO} from "src/interfaces/assign.dto";
import {UserEntity} from "src/entities/user.entity";

@Controller('users')
export class UsersController {
    constructor(private service: UsersService) {
    }

    @UseGuards(AuthGuard)
    @Get('me')
    me(@Req() req: requestUser.RequestWithUser) {
        return {email: req.user?.email}
    }

    @UseGuards(AuthGuard)
    @Get('my-user')
    myUser(@Req() req: requestUser.RequestWithUser) {
        return req.user
    }

    @Post('login')
    login(@Body() body: LoginDTO) {
        return this.service.login(body);
    }

    @UseGuards(AuthGuard)
    @Get('can-do/:permission')
    canDo(@Req() request: requestUser.RequestWithUser, @Param('permission') permission: string,) {
        return this.service.canDo(request.user, permission);
    }

    @Get('refresh-token')
    refreshToken(@Req() request: Request) {
        return this.service.refreshToken(
            request.headers['refresh-token'] as string,
        );
    }

    @UseGuards(AuthGuard)
    @Permissions(['USERS_EDIT'])
    @Post('assign-role/:id')
    assignRole(@Param('id') id: number, @Body() dto: AssignRoleDTO): Promise<UserEntity> {
        return this.service.assignRoles(id, dto);
    }

    @UseGuards(AuthGuard)
    @Permissions(['USERS_EDIT'])
    @Delete('remove-role/:id/:roleId')
    removeRole(@Param('id') id: number, @Param('roleId') roleId: number): Promise<{message: string}> {
        return this.service.removeRole(id, roleId);
    }

}
