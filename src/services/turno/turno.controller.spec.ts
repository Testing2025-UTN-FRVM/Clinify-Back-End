import { Test, type TestingModule } from "@nestjs/testing"
import { TurnoController } from "./turno.controller"
import { TurnoService } from "./turno.service"
import type { CreateTurnoDTO } from "src/interfaces/create/create-turno.dto"
import type { TurnoEntity } from "src/entities/turno.entity"
import type { ProcedimientoEntity } from "src/entities/procedimiento.entity"
import type { EmpleadoEntity } from "src/entities/empleado.entity"
import type { PacienteEntity } from "src/entities/paciente.entity"
import type { EspecialidadEntity } from "src/entities/especialidad.entity"
import type { EstadoTurnoEntity } from "src/entities/estadoTurno.entity"
import { BadRequestException } from "@nestjs/common"
import { jest } from "@jest/globals"
import {AuthGuard} from "src/middlewares/auth.middleware";
import {PersonaEntity} from "src/entities/persona.entity";
import {UserEntity} from "src/entities/user.entity";

describe("TurnoController", () => {
    let controller: TurnoController
    let service: TurnoService

    const mockTurnoService = {
        agendarTurno: jest.fn(),
    }

    const mockProcedimiento: ProcedimientoEntity = {
        id: 1,
        nombre: "Consulta General",
        descripcion: "Consulta médica general",
        duracion: 30,
        turnos: [],
        doctores: []
    }

    const mockUser: UserEntity = {
        email: 'agustin@cmail.com',
        password: '1234'
    }

    const mockPersonaUno: PersonaEntity = {
        id: 1,
        nombre: "Agustín",
        apellido: "Liendo Ortiz",
        fechaNacimiento: new Date('30-08-2004'),
        tipoDocumento: 'DNI',
        numeroDocumento: '333333333',
        telefono: '3534220000',
    }

    const mockPersonaDos: PersonaEntity = {
        id: 1,
        nombre: "Manuel",
        apellido: "Veronese",
        fechaNacimiento: new Date('09-08-2002'),
        tipoDocumento: 'DNI',
        numeroDocumento: '4444444444',
        telefono: '3534220000',
    }

    const mockDoctor: EmpleadoEntity = {
        id: 1,
        persona: mockPersonaUno,
        user: mockUser,
    }

    const mockPaciente: PacienteEntity = {
        id: 1,
        persona: mockPersonaDos,
        turnos: [],
        historiasClinicas: [],
    }

    const mockEspecialidad: EspecialidadEntity = {
        id: 1,
        nombre: "Medicina General",
        descripcion: "Atención médica general",
        activo: true,
        fechaRegistro: new Date("2024-01-01"),
        empleados: [],
        turnos: [],
    }

    const mockEstadoTurno: EstadoTurnoEntity = {
        id: 1,
        nombre: "Pendiente",
        descripcion: "Turno agendado pendiente de confirmación",
        activo: true,
        fechaRegistro: new Date("2024-01-01"),
        turnos: [],
    }

    const createTurnoDtoValido: CreateTurnoDTO = {
        fechaHoraTurno: "2025-10-10T10:00:00Z",
        motivo: "Consulta de rutina",
        procedimiento: 1,
        doctor: 1,
        paciente: 1,
        especialidad: 1,
    }

    const mockTurnoEntity: TurnoEntity = {
        id: 1,
        fechaHoraTurno: new Date("2025-10-10T10:00:00Z"),
        motivo: "Consulta de rutina",
        observaciones: null,
        activo: true,
        fechaRegistro: new Date("2025-01-15T08:00:00Z"),
        procedimiento: mockProcedimiento,
        doctor: mockDoctor,
        paciente: mockPaciente,
        especialidad: mockEspecialidad,
        estadoTurno: mockEstadoTurno,
        historiaClinica: [],
    }

    beforeEach(async () => {
        const guard = {canActivate: jest.fn().mockResolvedValue(true)}
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TurnoController],
            providers: [
                {
                    provide: TurnoService,
                    useValue: mockTurnoService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(guard)
            .compile()

        controller = module.get<TurnoController>(TurnoController)
        service = module.get<TurnoService>(TurnoService)

        // Limpiar mocks antes de cada test
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe("Definición del controlador", () => {
        it("debería estar definido el controlador", () => {
            expect(controller).toBeDefined()
        })

        it("debería estar definido el servicio", () => {
            expect(service).toBeDefined()
        })
    })

    describe("agendarTurno", () => {
        it("debería agendar un turno correctamente con datos válidos", async () => {
            mockTurnoService.agendarTurno.mockResolvedValue(mockTurnoEntity)

            const result = await controller.agendarTurno(createTurnoDtoValido)

            expect(service.agendarTurno).toHaveBeenCalledWith(createTurnoDtoValido)
            expect(service.agendarTurno).toHaveBeenCalledTimes(1)
            expect(result).toEqual(mockTurnoEntity)
            expect(result.id).toBe(1)
            expect(result.motivo).toBe("Consulta de rutina")
        })

        it("debería retornar un turno con todas las relaciones cargadas", async () => {
            mockTurnoService.agendarTurno.mockResolvedValue(mockTurnoEntity)

            const result = await controller.agendarTurno(createTurnoDtoValido)

            expect(result.procedimiento).toBeDefined()
            expect(result.doctor).toBeDefined()
            expect(result.paciente).toBeDefined()
            expect(result.especialidad).toBeDefined()
            expect(result.procedimiento.nombre).toBe(mockProcedimiento.nombre)
            expect(result.doctor.persona.nombre).toBe(mockPersonaUno.nombre)
            expect(result.paciente.persona.nombre).toBe(mockPersonaDos.nombre)
        })
    })

    describe("agendarTurno - Validación de datos", () => {
        it("debería fallar cuando la fecha es inválida", async () => {
            const dtoFechaInvalida: CreateTurnoDTO = {
                ...createTurnoDtoValido,
                fechaHoraTurno: "fecha-invalida",
            }
            mockTurnoService.agendarTurno.mockRejectedValue(new BadRequestException("Formato de fecha inválido"))

            await expect(controller.agendarTurno(dtoFechaInvalida)).rejects.toThrow(BadRequestException)
            await expect(controller.agendarTurno(dtoFechaInvalida)).rejects.toThrow("Formato de fecha inválido")
        })

        it("debería fallar cuando el motivo está vacío", async () => {
            const dtoMotivoVacio: CreateTurnoDTO = {
                ...createTurnoDtoValido,
                motivo: "",
            }
            mockTurnoService.agendarTurno.mockRejectedValue(new BadRequestException("El motivo no puede estar vacío"))

            await expect(controller.agendarTurno(dtoMotivoVacio)).rejects.toThrow(BadRequestException)
        })
    })

    describe("agendarTurno - Validación de tipos de datos", () => {
        it("debería fallar cuando fechaHoraTurno no es una cadena", async () => {
            const dtoFechaTipoIncorrecto: any = {
                ...createTurnoDtoValido,
                fechaHoraTurno: 12345,
            }
            mockTurnoService.agendarTurno.mockRejectedValue(
                new BadRequestException("El tipo de dato de fechaHoraTurno es incorrecto"),
            )

            await expect(controller.agendarTurno(dtoFechaTipoIncorrecto)).rejects.toThrow(BadRequestException)
        })

        it("debería fallar cuando motivo no es una cadena", async () => {
            const dtoMotivoTipoIncorrecto: any = {
                ...createTurnoDtoValido,
                motivo: 12345,
            }
            mockTurnoService.agendarTurno.mockRejectedValue(
                new BadRequestException("El tipo de dato de motivo es incorrecto"),
            )

            await expect(controller.agendarTurno(dtoMotivoTipoIncorrecto)).rejects.toThrow(BadRequestException)
        })

        it("debería fallar cuando procedimiento no es un número", async () => {
            const dtoProcedimientoTipoIncorrecto: any = {
                ...createTurnoDtoValido,
                procedimiento: "no-es-numero",
            }
            mockTurnoService.agendarTurno.mockRejectedValue(
                new BadRequestException("El tipo de dato de procedimiento es incorrecto"),
            )

            await expect(controller.agendarTurno(dtoProcedimientoTipoIncorrecto)).rejects.toThrow(BadRequestException)
        })

        it("debería fallar cuando doctor no es un número", async () => {
            const dtoDoctorTipoIncorrecto: any = {
                ...createTurnoDtoValido,
                doctor: "no-es-numero",
            }
            mockTurnoService.agendarTurno.mockRejectedValue(
                new BadRequestException("El tipo de dato de doctor es incorrecto"),
            )

            await expect(controller.agendarTurno(dtoDoctorTipoIncorrecto)).rejects.toThrow(BadRequestException)
        })

        it("debería fallar cuando faltan campos requeridos", async () => {
            const dtoIncompleto: any = {
                fechaHoraTurno: "2025-10-10T10:00:00Z",
                motivo: "Consulta",
                // Faltan: procedimiento, doctor, paciente, especialidad
            }
            mockTurnoService.agendarTurno.mockRejectedValue(new BadRequestException("Faltan campos requeridos"))

            await expect(controller.agendarTurno(dtoIncompleto)).rejects.toThrow(BadRequestException)
        })
    })

    describe("agendarTurno - Comprobaciones de DTO", () => {
        it("debería manejar correctamente un DTO con campos adicionales no esperados", async () => {
            const dtoConCamposExtra: any = {
                ...createTurnoDtoValido,
                campoExtra: "valor no esperado",
                otroCampo: 123,
            }
            mockTurnoService.agendarTurno.mockResolvedValue(mockTurnoEntity)

            const result = await controller.agendarTurno(dtoConCamposExtra)

            expect(result).toEqual(mockTurnoEntity)
            expect(service.agendarTurno).toHaveBeenCalledWith(dtoConCamposExtra)
        })

        it("debería fallar cuando el DTO es nulo", async () => {
            mockTurnoService.agendarTurno.mockRejectedValue(
                new BadRequestException("Los datos del turno no pueden ser nulos"),
            )

            await expect(controller.agendarTurno(null as any)).rejects.toThrow(BadRequestException)
        })

        it("debería fallar cuando el DTO no está definido", async () => {
            mockTurnoService.agendarTurno.mockRejectedValue(new BadRequestException("Los datos del turno son requeridos"))

            await expect(controller.agendarTurno(undefined as any)).rejects.toThrow(BadRequestException)
        })

    })
})
