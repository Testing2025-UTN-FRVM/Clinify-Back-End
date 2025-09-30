import { NotFoundException } from "@nestjs/common"
import { ConsultorioService } from "./consultorio.service"
import type { ConsultorioEntity } from "src/entities/consultorio.entity"
import type { CreateConsultorioDTO } from "src/interfaces/create/create-consultorio.dto"
import type { PatchConsultorioDTO } from "src/interfaces/patch/patch-consultorio.dto"
import { createMockRepository } from "../../../tests/utils/mock-repository"
import { jest } from "@jest/globals"

describe("ConsultorioService", () => {
    let service: ConsultorioService
    const repository = createMockRepository<ConsultorioEntity>()

    beforeEach(() => {
        jest.clearAllMocks()
        service = new ConsultorioService(repository as any)
    })

    describe("create", () => {
        it("debería crear un consultorio exitosamente", async () => {
            const dto: CreateConsultorioDTO = {
                numero: 101,
                observaciones: "Consultorio de Pediatría",
            }

            const consultorioCreado: ConsultorioEntity = {
                id: 1,
                numero: 101,
                observaciones: "Consultorio de Pediatría",
                empleados: [],
            } as ConsultorioEntity

            repository.create.mockReturnValue(consultorioCreado)
            repository.save.mockResolvedValue(consultorioCreado)

            const resultado = await service.create(dto)

            expect(repository.create).toHaveBeenCalledWith(dto)
            expect(repository.save).toHaveBeenCalledWith(consultorioCreado)
            expect(resultado).toEqual(consultorioCreado)
            expect(resultado.numero).toBe(101)
            expect(resultado.observaciones).toBe("Consultorio de Pediatría")
        })

        it("debería fallar al crear un consultorio con número duplicado", async () => {
            const dto: CreateConsultorioDTO = {
                numero: 101,
                observaciones: "Consultorio duplicado",
            }

            const error = new Error("Duplicate entry")
            repository.create.mockReturnValue(dto as any)
            repository.save.mockRejectedValue(error)

            await expect(service.create(dto)).rejects.toThrow(error)
            expect(repository.create).toHaveBeenCalledWith(dto)
        })

        it("debería fallar al crear un consultorio sin observaciones", async () => {
            const dto = {
                numero: 102,
                observaciones: "",
            } as CreateConsultorioDTO

            const error = new Error("La observacion del consultorio no puede estar vacia")
            repository.create.mockReturnValue(dto as any)
            repository.save.mockRejectedValue(error)

            await expect(service.create(dto)).rejects.toThrow()
        })

        it("debería fallar al crear un consultorio con número inválido", async () => {
            const dto = {
                numero: "ABC" as any,
                observaciones: "Consultorio inválido",
            } as CreateConsultorioDTO

            const error = new Error("El dato introducido debe ser un numero")
            repository.create.mockReturnValue(dto as any)
            repository.save.mockRejectedValue(error)

            await expect(service.create(dto)).rejects.toThrow()
        })
    })

    describe("edit", () => {
        it("debería editar un consultorio exitosamente", async () => {
            const consultorioExistente: ConsultorioEntity = {
                id: 1,
                numero: 101,
                observaciones: "Consultorio de Pediatría",
                empleados: [],
            } as ConsultorioEntity

            const dto: PatchConsultorioDTO = {
                numero: 102,
                observaciones: "Consultorio de Cardiología",
            }

            const consultorioActualizado: ConsultorioEntity = {
                ...consultorioExistente,
                ...dto,
            } as ConsultorioEntity

            repository.findOneBy.mockResolvedValue(consultorioExistente)
            repository.save.mockResolvedValue(consultorioActualizado)

            const resultado = await service.edit(1, dto)

            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 })
            expect(repository.merge).toHaveBeenCalledWith(consultorioExistente, dto)
            expect(repository.save).toHaveBeenCalledWith(consultorioExistente)
            expect(resultado.numero).toBe(102)
            expect(resultado.observaciones).toBe("Consultorio de Cardiología")
        })

        it("debería editar solo el número del consultorio", async () => {
            const consultorioExistente: ConsultorioEntity = {
                id: 1,
                numero: 101,
                observaciones: "Consultorio de Pediatría",
                empleados: [],
            } as ConsultorioEntity

            const dto: PatchConsultorioDTO = {
                numero: 103,
            }

            const consultorioActualizado: ConsultorioEntity = {
                ...consultorioExistente,
                numero: 103,
            } as ConsultorioEntity

            repository.findOneBy.mockResolvedValue(consultorioExistente)
            repository.save.mockResolvedValue(consultorioActualizado)

            const resultado = await service.edit(1, dto)

            expect(resultado.numero).toBe(103)
            expect(resultado.observaciones).toBe("Consultorio de Pediatría")
        })

        it("debería fallar al editar un consultorio inexistente", async () => {
            const dto: PatchConsultorioDTO = {
                numero: 102,
            }

            repository.findOneBy.mockResolvedValue(null)

            await expect(service.edit(999, dto)).rejects.toThrow(NotFoundException)
            await expect(service.edit(999, dto)).rejects.toThrow("No existe el consultorio con el id: 999")
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 })
            expect(repository.merge).not.toHaveBeenCalled()
            expect(repository.save).not.toHaveBeenCalled()
        })

        it("debería fallar al editar con un número ya existente", async () => {
            const consultorioExistente: ConsultorioEntity = {
                id: 1,
                numero: 101,
                observaciones: "Consultorio de Pediatría",
                empleados: [],
            } as ConsultorioEntity

            const dto: PatchConsultorioDTO = {
                numero: 102, // Este número ya existe en otro consultorio
            }

            repository.findOneBy.mockResolvedValue(consultorioExistente)
            repository.save.mockRejectedValue(new Error)

            await expect(service.edit(1, dto)).rejects.toThrow(Error)
        })
    })

    describe("delete", () => {
        it("debería eliminar un consultorio exitosamente", async () => {
            const consultorio: ConsultorioEntity = {
                id: 1,
                numero: 101,
                observaciones: "Consultorio de Pediatría",
                empleados: [],
            } as ConsultorioEntity

            repository.findOneBy.mockResolvedValue(consultorio)
            repository.remove.mockResolvedValue(consultorio)

            const resultado = await service.delete(1)

            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 })
            expect(repository.remove).toHaveBeenCalledWith(consultorio)
            expect(resultado).toEqual({
                message: "El consultorio: 101 fue eliminado correctamente",
            })
            expect(resultado.message).toContain("101")
        })

        it("debería fallar al eliminar un consultorio inexistente", async () => {
            repository.findOneBy.mockResolvedValue(null)

            await expect(service.delete(999)).rejects.toThrow(NotFoundException)
            await expect(service.delete(999)).rejects.toThrow("No existe el consultorio con el id: 999")
            expect(repository.remove).not.toHaveBeenCalled()
        })

        it("debería fallar al eliminar un consultorio con empleados asociados", async () => {
            const consultorioConEmpleados: ConsultorioEntity = {
                id: 1,
                numero: 101,
                observaciones: "Consultorio con empleados",
                empleados: [{ id: 1 } as any],
            } as ConsultorioEntity

            repository.findOneBy.mockResolvedValue(consultorioConEmpleados)
            repository.remove.mockRejectedValue(new Error)

            await expect(service.delete(1)).rejects.toThrow(Error)
        })
    })

    describe("findAll", () => {
        it("debería retornar todos los consultorios", async () => {
            const consultorios: ConsultorioEntity[] = [
                {
                    id: 1,
                    numero: 101,
                    observaciones: "Consultorio de Pediatría",
                    empleados: [],
                } as ConsultorioEntity,
                {
                    id: 2,
                    numero: 102,
                    observaciones: "Consultorio de Cardiología",
                    empleados: [],
                } as ConsultorioEntity,
            ]

            repository.find.mockResolvedValue(consultorios)

            const resultado = await service.findAll()

            expect(repository.find).toHaveBeenCalled()
            expect(resultado).toEqual(consultorios)
            expect(resultado).toHaveLength(2)
            expect(resultado[0].numero).toBe(101)
            expect(resultado[1].numero).toBe(102)
        })

        it("debería retornar un array vacío cuando no hay consultorios", async () => {
            repository.find.mockResolvedValue([])

            const resultado = await service.findAll()

            expect(repository.find).toHaveBeenCalled()
            expect(resultado).toEqual([])
            expect(resultado).toHaveLength(0)
        })
    })

    describe("findOne", () => {
        it("debería encontrar un consultorio por ID", async () => {
            const consultorio: ConsultorioEntity = {
                id: 1,
                numero: 101,
                observaciones: "Consultorio de Pediatría",
                empleados: [],
            } as ConsultorioEntity

            repository.findOneBy.mockResolvedValue(consultorio)

            const resultado = await service.findOne(1)

            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 })
            expect(resultado).toEqual(consultorio)
            expect(resultado.id).toBe(1)
            expect(resultado.numero).toBe(101)
        })

        it("debería lanzar NotFoundException cuando el consultorio no existe", async () => {
            repository.findOneBy.mockResolvedValue(null)

            await expect(service.findOne(99)).rejects.toThrow(NotFoundException)
            await expect(service.findOne(99)).rejects.toThrow("No existe el consultorio con el id: 99")
        })
    })
})
