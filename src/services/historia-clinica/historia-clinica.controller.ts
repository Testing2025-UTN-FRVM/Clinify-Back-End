import { Controller } from '@nestjs/common';
import {HistoriaClinicaService} from "src/services/historia-clinica/historia-clinica.service";

@Controller('historia-clinica')
export class HistoriaClinicaController {
    constructor(private readonly historiaClinicaService: HistoriaClinicaService) {}
}
