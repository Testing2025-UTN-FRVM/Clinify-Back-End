import {ObjectLiteral, Repository} from 'typeorm';

type RepoMethods =
    | 'create' | 'save' | 'find' | 'findOne' | 'findOneBy'
    | 'remove' | 'merge' | 'delete' | 'query';

export type MockRepository<T extends ObjectLiteral = any> =
    jest.Mocked<Pick<Repository<T>, RepoMethods>>;

export const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
} as unknown as MockRepository<T>);