import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {RoleEntity} from "src/entities/role.entity";
import {Repository} from "typeorm";
import {CreateRoleDTO} from "src/interfaces/create/create-role.dto";
import {PermissionsService} from "src/services/permissions/permissions.service";
import {AssignPermissionsDTO} from "src/interfaces/assign.dto";

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,

        private readonly permissionsService: PermissionsService,
    ) {}

    async create(dto: CreateRoleDTO): Promise<RoleEntity> {
        const newRole = this.roleRepository.create(dto);
        return await this.roleRepository.save(newRole);
    }

    async update(id: number, dto: CreateRoleDTO): Promise<RoleEntity> {
        const role = await this.findOne(id);
        this.roleRepository.merge(role, dto);
        return await this.roleRepository.save(role);
    }

    async delete(id: number): Promise<{message:string}> {
        const role = await this.findOne(id);
        await this.roleRepository.remove(role);
        return {message: "El rol: "+role.name+" fue eliminado correctamente"}
    }

    async findAll(): Promise<RoleEntity[]> {
        return await this.roleRepository.find();
    }
    async findOne(id: number): Promise<RoleEntity> {
        const role = await this.roleRepository.findOneBy({id});
        if (!role) {throw new Error("No existe el rol con el id: "+id)}
        return role;
    }

    async assignPermissions(id: number, assignPermissionsDto: AssignPermissionsDTO): Promise<RoleEntity> {
        const role = await this.findOne(id);

        const roles = await Promise.all(assignPermissionsDto.permissionCodes.map((permissionId)=> this.permissionsService.findOne(permissionId)));

        if(!role.permissions) {
            role.permissions = roles;
        } else {
            role.permissions= [...role.permissions, ...roles];
        }
        return this.roleRepository.save(role);
    }

    async removePermission(id:number, permissionId:number): Promise<{message: string}> {
        const role = await this.findOne(id);
        await this.permissionsService.findOne(permissionId);
        role.permissions = role.permissions.filter(permission => permission.id !== permissionId);
        await this.roleRepository.save(role);
        return {message: 'Permiso eliminado'};
    }
}
