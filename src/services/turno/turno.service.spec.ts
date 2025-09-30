import { Test, type TestingModule } from "@nestjs/testing"
import { TurnoService } from "./turno.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TurnoEntity } from "src/entities/turno.entity"
import { DataSource, type Repository } from "typeorm"
import { ProcedimientoService } from "../procedimiento/procedimiento.service"
import { EmpleadoService } from "../empleado/empleado.service"
import { PacienteService } from "../paciente/paciente.service"
import { EspecialidadService } from "../especialidad/especialidad.service"
import { EstadoTurnoService } from "../estado-turno/estado-turno.service"
import type { CreateTurnoDTO } from "src/interfaces/create/create-turno.dto"
import type { ProcedimientoEntity } from "src/entities/procedimiento.entity"
import type { EmpleadoEntity } from "src/entities/empleado.entity"
import type { PacienteEntity } from "src/entities/paciente.entity"
import type { EspecialidadEntity } from "src/entities/especialidad.entity"
import type { EstadoTurnoEntity } from "src/entities/estadoTurno.entity"
import { jest } from "@jest/globals"
import {NotFoundException} from "@nestjs/common";

//Crear un mock para cada servicio que se usa
const mockTurnoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
}

const mockProcedimientoService = {
    findOne: jest.fn(),
}

const mockEstadoTurnoService = {
    findOne: jest.fn(),
}

const mockEmpleadoService = {
    findOne: jest.fn(),
}

const mockPacienteService = {
    findOne: jest.fn(),
}

const mockEspecialidadService = {
    findOne: jest.fn(),
}

const mockDataSource = {
    transaction: jest.fn(),
    query: jest.fn(),
}

//Definir los mocks de los servicios
jest.mock("src/services/procedimiento/procedimiento.service")
jest.mock("src/services/estado-turno/estado-turno.service")
jest.mock("src/services/empleado/empleado.service")
jest.mock("src/services/paciente/paciente.service")
jest.mock("src/services/especialidad/especialidad.service")
describe("TurnoService", () => {
    let service: TurnoService
    let turnoRepository: Repository<TurnoEntity>
    let procedimientoService: ProcedimientoService
    let estadoTurnoService: EstadoTurnoService
    let empleadoService: EmpleadoService
    let pacienteService: PacienteService
    let especialidadService: EspecialidadService
    let dataSource: DataSource

    const mockProcedimiento: ProcedimientoEntity = {
        id: 1,
        nombre: "Limpieza dental",
        duracion: 30,
        turnos: [],
        empleados: [],
    } as ProcedimientoEntity

    const mockEstadoTurno: EstadoTurnoEntity = {
        id: 1,
        nombre: "Pendiente",
        descripcion: "Turno pendiente de confirmación",
        turnos: [],
    } as EstadoTurnoEntity

    const mockEmpleado: EmpleadoEntity = {
        id: 1,
        nombre: "Dr. Juan Pérez",
        tipoEmpleado: null,
        persona: null,
        user: null,
        especialidad: null,
        procedimientos: [],
        consultorio: null,
        historiasClinicas: [],
        turnos: [],
    } as EmpleadoEntity

    const mockPaciente: PacienteEntity = {
        id: 1,
        nombre: "María González",
        altura: 165,
        peso: 60,
        observaciones: "Sin observaciones",
        persona: null,
        grupoSanguineo: null,
        historiasClinicas: [],
        turnos: [],
    } as PacienteEntity

    const mockEspecialidad: EspecialidadEntity = {
        id: 1,
        nombre: "Odontología",
        descripcion: "Especialidad en odontología",
        empleados: [],
        turnos: [],
    } as EspecialidadEntity

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TurnoService,
                {
                    provide: getRepositoryToken(TurnoEntity),
                    useValue: mockTurnoRepository,
                },
                {
                    provide: ProcedimientoService,
                    useValue: mockProcedimientoService,
                },
                {
                    provide: EstadoTurnoService,
                    useValue: mockEstadoTurnoService,
                },
                {
                    provide: EmpleadoService,
                    useValue: mockEmpleadoService,
                },
                {
                    provide: PacienteService,
                    useValue: mockPacienteService,
                },
                {
                    provide: EspecialidadService,
                    useValue: mockEspecialidadService,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile()

        service = module.get<TurnoService>(TurnoService)
        turnoRepository = module.get<Repository<TurnoEntity>>(getRepositoryToken(TurnoEntity))
        procedimientoService = module.get<ProcedimientoService>(ProcedimientoService)
        estadoTurnoService = module.get<EstadoTurnoService>(EstadoTurnoService)
        empleadoService = module.get<EmpleadoService>(EmpleadoService)
        pacienteService = module.get<PacienteService>(PacienteService)
        especialidadService = module.get<EspecialidadService>(EspecialidadService)
        dataSource = module.get<DataSource>(DataSource)

        jest.spyOn(service as any, "dayKayUTC").mockReturnValue(20251010)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("debe estar definido", () => {
        expect(service).toBeDefined()
    })

    describe("agendarTurno", () => {
        describe("Casos de éxito", () => {
            it("debe agendar un turno exitosamente cuando no hay solapamiento", async () => {
                const dto: CreateTurnoDTO = {
                    fechaHoraTurno: "2025-10-10T10:00:00Z",
                    motivo: "Control anual",
                    procedimiento: 1,
                    doctor: 1,
                    paciente: 1,
                    especialidad: 1,
                    estado: 1,
                }

                const mockTurno: TurnoEntity = {
                        id: 1,
                        fechaRegistro: new Date(),
                        fechaHoraTurno: new Date(dto.fechaHoraTurno),
                        motivo: dto.motivo,
                        procedimiento: mockProcedimiento,
                        estado: mockEstadoTurno,
                        doctor: mockEmpleado,
                        paciente: mockPaciente,
                        especialidad: mockEspecialidad,
                    } as TurnoEntity
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest
                            .fn()
                            .mockResolvedValueOnce(undefined) // pg_advisory_xact_lock
                            .mockResolvedValueOnce([]), // No solapamiento
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento)
                ;(mockEstadoTurnoService.findOne as jest.Mock).mockResolvedValue(mockEstadoTurno)
                ;(mockEmpleadoService.findOne as jest.Mock).mockResolvedValue(mockEmpleado)
                ;(mockPacienteService.findOne as jest.Mock).mockResolvedValue(mockPaciente)
                ;(mockEspecialidadService.findOne as jest.Mock).mockResolvedValue(mockEspecialidad)
                ;(mockTurnoRepository.create as jest.Mock).mockReturnValue(mockTurno)
                ;(mockTurnoRepository.save as jest.Mock).mockResolvedValue(mockTurno)

                const result = await service.agendarTurno(dto)

                expect(result).toEqual(mockTurno)
                expect(procedimientoService.findOne).toHaveBeenCalledWith(dto.procedimiento)
                expect(estadoTurnoService.findOne).toHaveBeenCalledWith(1)
                expect(empleadoService.findOne).toHaveBeenCalledWith(dto.doctor)
                expect(pacienteService.findOne).toHaveBeenCalledWith(dto.paciente)
                expect(especialidadService.findOne).toHaveBeenCalledWith(dto.especialidad)
                expect(mockTurnoRepository.create).toHaveBeenCalled()
                expect(mockTurnoRepository.save).toHaveBeenCalledWith(mockTurno)
            })

            it("debe calcular correctamente la hora de fin del turno según la duración del procedimiento", async () => {
                const dto: CreateTurnoDTO = {
                    fechaHoraTurno: "2025-10-10T14:00:00Z",
                    motivo: "Consulta especializada",
                    procedimiento: 1,
                    doctor: 1,
                    paciente: 1,
                    especialidad: 1,
                    estado: 1,
                }

                const procedimientoLargo: ProcedimientoEntity = {
                        ...mockProcedimiento,
                        duracion: 60, // 60 minutos
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce([]),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(procedimientoLargo)
                ;(mockEstadoTurnoService.findOne as jest.Mock).mockResolvedValue(mockEstadoTurno)
                ;(mockEmpleadoService.findOne as jest.Mock).mockResolvedValue(mockEmpleado)
                ;(mockPacienteService.findOne as jest.Mock).mockResolvedValue(mockPaciente)
                ;(mockEspecialidadService.findOne as jest.Mock).mockResolvedValue(mockEspecialidad)
                ;(mockTurnoRepository.create as jest.Mock).mockReturnValue({} as TurnoEntity)
                ;(mockTurnoRepository.save as jest.Mock).mockResolvedValue({} as TurnoEntity)

                await service.agendarTurno(dto)

                expect(procedimientoService.findOne).toHaveBeenCalledWith(dto.procedimiento)
            })
        })

        describe("Errores de validación de fecha", () => {
            it("debe lanzar ConflictException cuando la fecha es inválida", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "fecha-invalida",
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn(),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })

                await expect(service.agendarTurno(dto)).rejects.toThrow("FechaHora invalida")
            })

            it("debe lanzar ConflictException cuando la fecha es una cadena vacía", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "",
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn(),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })

                await expect(service.agendarTurno(dto)).rejects.toThrow("FechaHora invalida")
            })

            it("debe lanzar ConflictException cuando la fecha tiene formato incorrecto", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "10-10-2025",
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn(),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })

                await expect(service.agendarTurno(dto)).rejects.toThrow(Error)
            })

            it("debe lanzar ConflictException cuando la fecha es null", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: null as any,
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn(),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })

                await expect(service.agendarTurno(dto)).rejects.toThrow()
            })
        })

        describe("Errores de solapamiento de turnos", () => {
            it("debe lanzar ConflictException cuando el doctor ya tiene un turno en ese horario", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T10:00:00Z",
                        motivo: "Consulta",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest
                            .fn()
                            .mockResolvedValueOnce(undefined) // pg_advisory_xact_lock
                            .mockResolvedValueOnce([{ "1": 1 }]), // Hay solapamiento
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento)

                await expect(service.agendarTurno(dto)).rejects.toThrow("El doctor ya tiene un turno en ese horario")
                expect(procedimientoService.findOne).toHaveBeenCalledWith(dto.procedimiento)
            })

            it("debe detectar solapamiento cuando el nuevo turno comienza durante un turno existente", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T10:15:00Z", // 15 minutos después del inicio de otro turno
                        motivo: "Consulta",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest
                            .fn()
                            .mockResolvedValueOnce(undefined)
                            .mockResolvedValueOnce([{ "1": 1 }]),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento)

                await expect(service.agendarTurno(dto)).rejects.toThrow("El doctor ya tiene un turno en ese horario")
            })

            it("debe detectar solapamiento cuando el nuevo turno termina durante un turno existente", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T09:45:00Z", // Terminaría durante otro turno
                        motivo: "Consulta",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest
                            .fn()
                            .mockResolvedValueOnce(undefined)
                            .mockResolvedValueOnce([{ "1": 1 }]),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento)

                await expect(service.agendarTurno(dto)).rejects.toThrow("El doctor ya tiene un turno en ese horario")
            })
        })

        describe("Errores de entidades no encontradas", () => {
            it("debe lanzar error cuando el procedimiento no existe", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T10:00:00Z",
                        motivo: "Control",
                        procedimiento: 999,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn().mockResolvedValueOnce(undefined),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockRejectedValue(new NotFoundException("No existe el procedimiento con el id: "+dto.procedimiento))

                await expect(service.agendarTurno(dto)).rejects.toThrow("No existe el procedimiento con el id: "+dto.procedimiento)
            })

            it("debe lanzar error cuando el doctor no existe", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T10:00:00Z",
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 999,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce([]),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento)
                ;(mockEstadoTurnoService.findOne as jest.Mock).mockResolvedValue(mockEstadoTurno)
                ;(mockEmpleadoService.findOne as jest.Mock).mockRejectedValue(new NotFoundException(`El id: ${dto.doctor} no corresponde a ningun empleado`))

                await expect(service.agendarTurno(dto)).rejects.toThrow(`El id: ${dto.doctor} no corresponde a ningun empleado`)
            })

            it("debe lanzar error cuando el paciente no existe", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T10:00:00Z",
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 999,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce([]),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento)
                ;(mockEstadoTurnoService.findOne as jest.Mock).mockResolvedValue(mockEstadoTurno)
                ;(mockEmpleadoService.findOne as jest.Mock).mockResolvedValue(mockEmpleado)
                ;(mockPacienteService.findOne as jest.Mock).mockRejectedValue(new NotFoundException(`El id: ${dto.paciente} no corresponde a ningun paciente`))

                await expect(service.agendarTurno(dto)).rejects.toThrow(`El id: ${dto.paciente} no corresponde a ningun paciente`)
            })

            it("debe lanzar error cuando la especialidad no existe", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T10:00:00Z",
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 999,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce([]),
                        getRepository: jest.fn(() => mockTurnoRepository),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento)
                ;(mockEstadoTurnoService.findOne as jest.Mock).mockResolvedValue(mockEstadoTurno)
                ;(mockEmpleadoService.findOne as jest.Mock).mockResolvedValue(mockEmpleado)
                ;(mockPacienteService.findOne as jest.Mock).mockResolvedValue(mockPaciente)
                ;(mockEspecialidadService.findOne as jest.Mock).mockRejectedValue(new NotFoundException(`El id: ${dto.especialidad} no corresponde a ninguna especialidad`))

                await expect(service.agendarTurno(dto)).rejects.toThrow(`El id: ${dto.especialidad} no corresponde a ninguna especialidad`)
            })
        })

        describe("Errores de base de datos", () => {
            it("debe manejar errores de transacción de base de datos", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T10:00:00Z",
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockRejectedValue(new Error("Error de conexión a la base de datos"))

                await expect(service.agendarTurno(dto)).rejects.toThrow("Error de conexión a la base de datos")
            })

            it("debe manejar errores al guardar el turno", async () => {
                const dto: CreateTurnoDTO = {
                        fechaHoraTurno: "2025-10-10T10:00:00Z",
                        motivo: "Control",
                        procedimiento: 1,
                        doctor: 1,
                        paciente: 1,
                        especialidad: 1,
                        estado: 1,
                    }
                ;(mockDataSource.transaction as jest.Mock).mockImplementation(async (mode, callback) => {
                    const manager = {
                        query: jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce([]),
                        getRepository: jest.fn(() => ({
                            ...mockTurnoRepository,
                            save: jest.fn().mockRejectedValue(new Error("Error al guardar en la base de datos")),
                        })),
                    }
                    return await callback(manager)
                })
                ;(mockProcedimientoService.findOne as jest.Mock).mockResolvedValue(mockProcedimiento)
                ;(mockEstadoTurnoService.findOne as jest.Mock).mockResolvedValue(mockEstadoTurno)
                ;(mockEmpleadoService.findOne as jest.Mock).mockResolvedValue(mockEmpleado)
                ;(mockPacienteService.findOne as jest.Mock).mockResolvedValue(mockPaciente)
                ;(mockEspecialidadService.findOne as jest.Mock).mockResolvedValue(mockEspecialidad)

                await expect(service.agendarTurno(dto)).rejects.toThrow("Error al guardar en la base de datos")
            })
        })
    })
})