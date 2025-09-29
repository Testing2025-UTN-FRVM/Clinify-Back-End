import {ObjectLiteral, Repository} from 'typeorm';

export type MockRepository<T extends ObjectLiteral = any> = {
    [P in keyof Repository<T>]: Repository<T>[P] extends (...args: any[]) => any
        ? jest.MockedFunction<Repository<T>[P]>
        : Repository<T>[P];
};

export const createMockRepository = <T extends ObjectLiteral = any>(): Partial<MockRepository<T>> => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
});