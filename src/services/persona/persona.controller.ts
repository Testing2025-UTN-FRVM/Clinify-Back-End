import {Body, Controller, Param, Patch, UseGuards} from '@nestjs/common';
import {PersonaService} from "src/services/persona/persona.service";
import {AuthGuard} from "src/middlewares/auth.middleware";
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import {PatchPersonaDTO} from "src/interfaces/patch.dto";
import {PersonaEntity} from "src/entities/persona.entity";

@Controller('personas')
export class PersonaController {
    constructor(private readonly personaService: PersonaService) {}

    @UseGuards(AuthGuard)
    @Permissions(['PERSONAS_EDIT'])
    @Patch('edit/:id')
    edit(@Param('id') id:number, @Body() dto: PatchPersonaDTO): Promise<PersonaEntity> {
        return this.personaService.edit(id, dto);
    }
}
