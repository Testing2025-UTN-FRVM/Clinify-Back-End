import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {PermissionEntity} from "src/entities/permission.entity";
import {Repository} from "typeorm";
import {CreatePermissionDTO} from "src/interfaces/create/create-permission.dto";

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
    ) {}

    async create(dto: CreatePermissionDTO): Promise<PermissionEntity> {
        const permission = this.permissionRepository.create(dto);
        return await this.permissionRepository.save(permission);
    }

    async update(id: number, dto: CreatePermissionDTO): Promise<PermissionEntity> {
        const permission = await this.findOne(id);
        this.permissionRepository.merge(permission, dto);
        return await this.permissionRepository.save(permission);
    }

    async delete(id:number): Promise<{message:string}> {
        const permission = await this.findOne(id);
        await this.permissionRepository.remove(permission);
        return {message: "El permiso: "+permission.code+" fue eliminado correctamente"}
    }

    async findOne(id: number): Promise<PermissionEntity> {
        const permission = await this.permissionRepository.findOneBy({id});
        if (!permission) {throw new Error("No existe el permiso con el id: "+id)}
        return permission;
    }

    async findAll(): Promise<PermissionEntity[]> {
        return await this.permissionRepository.find();
    }
}
