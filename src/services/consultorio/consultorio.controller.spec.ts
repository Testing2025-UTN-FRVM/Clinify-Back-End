import { Test, type TestingModule } from "@nestjs/testing"
import { ConsultorioController } from "./consultorio.controller"
import { ConsultorioService } from "./consultorio.service"
import type { CreateConsultorioDTO } from "src/interfaces/create/create-consultorio.dto"
import type { PatchConsultorioDTO } from "src/interfaces/patch/patch-consultorio.dto"
import type { ConsultorioEntity } from "src/entities/consultorio.entity"
import {NotFoundException, BadRequestException} from "@nestjs/common"
import { jest } from "@jest/globals"
import {AuthGuard} from "src/middlewares/auth.middleware";

describe("ConsultorioController", () => {
    let controller: ConsultorioController
    let service: ConsultorioService

    const mockConsultorioService = {
        create: jest.fn(),
        edit: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
    }

    beforeEach(async () => {
        const guard = {canActivate: jest.fn().mockResolvedValue(true)}
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ConsultorioController],
            providers: [
                {
                    provide: ConsultorioService,
                    useValue: mockConsultorioService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(guard)
            .compile()

        controller = module.get<ConsultorioController>(ConsultorioController)
        service = module.get<ConsultorioService>(ConsultorioService)

        // Limpiar mocks antes de cada test
        jest.clearAllMocks()
    })

    it("debería estar definido", () => {
        expect(controller).toBeDefined()
    })

    describe("create", () => {
        const createDto: CreateConsultorioDTO = {
            numero: 101,
            observaciones: "Consultorio de cardiología",
        }

        const consultorioCreado: ConsultorioEntity = {
            id: 1,
            numero: 101,
            observaciones: "Consultorio de cardiología",
            empleados: [],
        } as unknown as ConsultorioEntity

        it("debería crear un consultorio exitosamente", async () => {
            mockConsultorioService.create.mockResolvedValue(consultorioCreado)

            const resultado = await controller.create(createDto)

            expect(resultado).toEqual(consultorioCreado)
            expect(service.create).toHaveBeenCalledWith(createDto)
            expect(service.create).toHaveBeenCalledTimes(1)
        })

        it("debería lanzar error cuando el número de consultorio ya existe", async () => {
            mockConsultorioService.create.mockRejectedValue(new BadRequestException("El número de consultorio ya existe"))

            await expect(controller.create(createDto)).rejects.toThrow(BadRequestException)
            expect(service.create).toHaveBeenCalledWith(createDto)
        })

        it("debería lanzar error cuando el número es inválido", async () => {
            const dtoInvalido = { ...createDto, numero: -1 }
            mockConsultorioService.create.mockRejectedValue(
                new BadRequestException("El número del consultorio debe ser positivo")
            )

            await expect(controller.create(dtoInvalido)).rejects.toThrow(BadRequestException)
        })

        it("debería lanzar error cuando las observaciones están vacías", async () => {
            const dtoInvalido = { ...createDto, observaciones: "" }
            mockConsultorioService.create.mockRejectedValue(
                new BadRequestException("La observacion del consultorio no puede estar vacia"),
            )

            await expect(controller.create(dtoInvalido)).rejects.toThrow(BadRequestException)
        })


        it("debería lanzar error cuando el DTO tiene campos adicionales no permitidos", async () => {
            const dtoConCamposExtra = { ...createDto, campoExtra: "no permitido" }
            mockConsultorioService.create.mockRejectedValue(new BadRequestException("Campos no permitidos en el DTO"))

            await expect(controller.create(dtoConCamposExtra as any)).rejects.toThrow(BadRequestException)
        })
    })

    describe("edit", () => {
        const patchDto: PatchConsultorioDTO = {
            numero: 102,
            observaciones: "Consultorio actualizado",
        }

        const consultorioActualizado: ConsultorioEntity = {
            id: 1,
            numero: 102,
            observaciones: "Consultorio actualizado",
            empleados: [],
        } as unknown as ConsultorioEntity

        it("debería actualizar un consultorio exitosamente", async () => {
            mockConsultorioService.edit.mockResolvedValue(consultorioActualizado)

            const resultado = await controller.edit(patchDto, 1)

            expect(resultado).toEqual(consultorioActualizado)
            expect(service.edit).toHaveBeenCalledWith(1, patchDto)
            expect(service.edit).toHaveBeenCalledTimes(1)
        })

        it("debería actualizar solo el número del consultorio", async () => {
            const patchDtoSoloNumero: PatchConsultorioDTO = { numero: 103 }
            const consultorioConNumeroActualizado = { ...consultorioActualizado, numero: 103 }

            mockConsultorioService.edit.mockResolvedValue(consultorioConNumeroActualizado)

            const resultado = await controller.edit(patchDtoSoloNumero, 1)

            expect(resultado.numero).toBe(103)
            expect(service.edit).toHaveBeenCalledWith(1, patchDtoSoloNumero)
        })

        it("debería actualizar solo las observaciones del consultorio", async () => {
            const patchDtoSoloObservaciones: PatchConsultorioDTO = {
                observaciones: "Nueva observación",
            }
            const consultorioConObservacionesActualizadas = {
                ...consultorioActualizado,
                observaciones: "Nueva observación",
            }

            mockConsultorioService.edit.mockResolvedValue(consultorioConObservacionesActualizadas)

            const resultado = await controller.edit(patchDtoSoloObservaciones, 1)

            expect(resultado.observaciones).toBe("Nueva observación")
            expect(service.edit).toHaveBeenCalledWith(1, patchDtoSoloObservaciones)
        })

        it("debería lanzar error cuando el consultorio no existe", async () => {
            mockConsultorioService.edit.mockRejectedValue(new NotFoundException("Consultorio no encontrado"))

            await expect(controller.edit(patchDto, 999)).rejects.toThrow(NotFoundException)
            expect(service.edit).toHaveBeenCalledWith(999, patchDto)
        })

        it("debería lanzar error cuando el ID es inválido", async () => {
            mockConsultorioService.edit.mockRejectedValue(new BadRequestException("ID inválido"))

            await expect(controller.edit(patchDto, -1)).rejects.toThrow(BadRequestException)
        })

        it("debería lanzar error cuando el nuevo número ya existe", async () => {
            mockConsultorioService.edit.mockRejectedValue(new BadRequestException("El número de consultorio ya existe"))

            await expect(controller.edit(patchDto, 1)).rejects.toThrow(BadRequestException)
        })

        it("debería lanzar error cuando el DTO está vacío", async () => {
            const dtoVacio: PatchConsultorioDTO = {}
            mockConsultorioService.edit.mockRejectedValue(
                new BadRequestException("Debe proporcionar al menos un campo para actualizar"),
            )

            await expect(controller.edit(dtoVacio, 1)).rejects.toThrow(BadRequestException)
        })
    })

    describe("delete", () => {
        const mensajeExito = { message: "Consultorio eliminado exitosamente" }

        it("debería eliminar un consultorio exitosamente", async () => {
            mockConsultorioService.delete.mockResolvedValue(mensajeExito)

            const resultado = await controller.delete(1)

            expect(resultado).toEqual(mensajeExito)
            expect(service.delete).toHaveBeenCalledWith(1)
            expect(service.delete).toHaveBeenCalledTimes(1)
        })

        it("debería lanzar error cuando el consultorio no existe", async () => {
            mockConsultorioService.delete.mockRejectedValue(new NotFoundException("Consultorio no encontrado"))

            await expect(controller.delete(999)).rejects.toThrow(NotFoundException)
            expect(service.delete).toHaveBeenCalledWith(999)
        })

        it("debería lanzar error cuando el consultorio tiene empleados asociados", async () => {
            mockConsultorioService.delete.mockRejectedValue(
                new BadRequestException("No se puede eliminar el consultorio porque tiene empleados asociados"),
            )

            await expect(controller.delete(1)).rejects.toThrow(BadRequestException)
        })
    })

    describe("findAll", () => {
        const consultorios: ConsultorioEntity[] = [
            {
                id: 1,
                numero: 101,
                observaciones: "Consultorio 1",
                empleados: [],
            } as unknown as ConsultorioEntity,
            {
                id: 2,
                numero: 102,
                observaciones: "Consultorio 2",
                empleados: [],
            } as unknown as ConsultorioEntity,
        ]

        it("debería retornar todos los consultorios", async () => {
            mockConsultorioService.findAll.mockResolvedValue(consultorios)

            const resultado = await controller.findAll()

            expect(resultado).toEqual(consultorios)
            expect(resultado).toHaveLength(2)
            expect(service.findAll).toHaveBeenCalledTimes(1)
        })

        it("debería retornar un array vacío cuando no hay consultorios", async () => {
            mockConsultorioService.findAll.mockResolvedValue([])

            const resultado = await controller.findAll()

            expect(resultado).toEqual([])
            expect(resultado).toHaveLength(0)
            expect(service.findAll).toHaveBeenCalledTimes(1)
        })

        it("debería retornar consultorios con la estructura correcta", async () => {
            mockConsultorioService.findAll.mockResolvedValue(consultorios)

            const resultado = await controller.findAll()

            resultado.forEach((consultorio) => {
                expect(consultorio).toHaveProperty("id")
                expect(consultorio).toHaveProperty("numero")
                expect(consultorio).toHaveProperty("observaciones")
                expect(consultorio).toHaveProperty("empleados")
                expect(typeof consultorio.numero).toBe("number")
                expect(typeof consultorio.observaciones).toBe("string")
            })
        })
    })

    describe("findOne", () => {
        const consultorio: ConsultorioEntity = {
            id: 1,
            numero: 101,
            observaciones: "Consultorio de cardiología",
            empleados: [],
        } as unknown as ConsultorioEntity

        it("debería retornar un consultorio por ID", async () => {
            mockConsultorioService.findOne.mockResolvedValue(consultorio)

            const resultado = await controller.findOne(1)

            expect(resultado).toEqual(consultorio)
            expect(service.findOne).toHaveBeenCalledWith(1)
            expect(service.findOne).toHaveBeenCalledTimes(1)
        })

        it("debería lanzar error cuando el consultorio no existe", async () => {
            mockConsultorioService.findOne.mockRejectedValue(new NotFoundException("Consultorio no encontrado"))

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException)
            expect(service.findOne).toHaveBeenCalledWith(999)
        })

        it("debería retornar un consultorio con la estructura correcta", async () => {
            mockConsultorioService.findOne.mockResolvedValue(consultorio)

            const resultado = await controller.findOne(1)

            expect(resultado).toHaveProperty("id")
            expect(resultado).toHaveProperty("numero")
            expect(resultado).toHaveProperty("observaciones")
            expect(resultado).toHaveProperty("empleados")
            expect(typeof resultado.numero).toBe("number")
            expect(typeof resultado.observaciones).toBe("string")
            expect(Array.isArray(resultado.empleados)).toBe(true)
        })
    })
})
