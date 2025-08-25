import { Injectable } from '@nestjs/common';
import {
    registerDecorator, ValidationArguments, ValidationOptions,
    ValidatorConstraint, ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource, Not } from 'typeorm';
import { PersonaEntity } from 'src/entities/persona.entity';

@ValidatorConstraint({ name: 'IsPersonaDocUnique', async: true })
@Injectable()
export class IsPersonaDocUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private readonly dataSource: DataSource) {}

    async validate(_: any, args: ValidationArguments) {
        // constraints: [propTipo, propNumero, { ignoreIdField? }]
        const propTipo = (args.constraints?.[0] as string) || 'tipoDocumento';
        const propNumero = (args.constraints?.[1] as string) || 'numeroDocumento';
        const ignoreIdField = (args.constraints?.[2]?.ignoreIdField as string) || 'id';

        const obj = args.object as any;
        const tipo = obj?.[propTipo];
        const numero = obj?.[propNumero];
        if (!tipo || !numero) return true; // otras reglas (IsNotEmpty) se encargan

        const where: any = { tipoDocumento: tipo, numeroDocumento: numero };
        const ignoreId = obj?.[ignoreIdField];
        if (ignoreId) where.id = Not(ignoreId);

        const repo = this.dataSource.getRepository(PersonaEntity);
        const exists = await repo.exist({ where });
        return !exists;
    }

    defaultMessage() {
        return 'Ya existe una persona con ese tipo y número de documento.';
    }
}

export function IsPersonaDocUnique(
    propTipo: string = 'tipoDocumento',
    propNumero: string = 'numeroDocumento',
    options?: { ignoreIdField?: string },
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            constraints: [propTipo, propNumero, options || {}],
            options: validationOptions,
            validator: IsPersonaDocUniqueConstraint,
        });
    };
}
