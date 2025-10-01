import { Injectable } from '@nestjs/common';
import {
    registerDecorator, ValidationArguments, ValidationOptions,
    ValidatorConstraint, ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource, Not } from 'typeorm';
import {ConsultorioEntity} from "src/entities/consultorio.entity";

@ValidatorConstraint({ name: 'IsUniqueConsultorio', async: true })
@Injectable()
export class IsUniqueConsultorioConstraint implements ValidatorConstraintInterface {
    constructor(private readonly dataSource: DataSource) {}

    async validate(value: number, args: ValidationArguments) {
        if (!value) return true;
        const ignoreIdField = (args.constraints?.[0]?.ignoreIdField as string) || 'id';
        const ignoreId = (args.object as any)?.[ignoreIdField];

        const where: any = { numero: value };
        if (ignoreId) where.id = Not(ignoreId);

        const repo = this.dataSource.getRepository(ConsultorioEntity);
        const exists = await repo.exist({ where });
        return !exists;
    }

    defaultMessage() {
        return 'Ya existe un consultorio con ese número.';
    }
}

export function IsUniqueConsultorio(
    options?: { ignoreIdField?: number },
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            constraints: [options || {}],
            options: validationOptions,
            validator: IsUniqueConsultorioConstraint,
        });
    };
}
