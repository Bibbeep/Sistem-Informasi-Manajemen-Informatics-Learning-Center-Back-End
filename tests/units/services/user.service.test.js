/* eslint-disable no-undef */
jest.mock('../../../src/db/models/user');
const UserService = require('../../../src/services/user.service');
const User = require('../../../src/db/models/user');

describe('User Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMany Tests', () => {
        it('should return user data with default params and multiple total page', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                role: 'all',
                level: 'all',
            };
            const mockFetchCount = 20;
            const mockFetchRows = [
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
            ];

            User.findAndCountAll.mockResolvedValue({
                count: mockFetchCount,
                rows: mockFetchRows,
            });

            const result = await UserService.getMany(mockParams);

            expect(User.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                    limit: mockParams.limit,
                    offset: (mockParams.page - 1) * mockParams.limit,
                    order: [['id', 'ASC']],
                    attributes: {
                        exclude: ['hashedPassword'],
                    },
                }),
            );
            expect(result).toEqual(
                expect.objectContaining({
                    pagination: {
                        currentRecords: 10,
                        totalRecords: 20,
                        currentPage: 1,
                        totalPages: 2,
                        nextPage: 2,
                        prevPage: null,
                    },
                    users: mockFetchRows,
                }),
            );
        });

        it('should return user data with role user and member level basic params', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                role: 'user',
                level: 'basic',
            };
            const mockFetchCount = 10;
            const mockFetchRows = [
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
            ];

            User.findAndCountAll.mockResolvedValue({
                count: mockFetchCount,
                rows: mockFetchRows,
            });

            const result = await UserService.getMany(mockParams);

            expect(User.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        role: 'User',
                        memberLevel: 'Basic',
                    },
                    limit: mockParams.limit,
                    offset: (mockParams.page - 1) * mockParams.limit,
                    order: [['id', 'ASC']],
                    attributes: {
                        exclude: ['hashedPassword'],
                    },
                }),
            );
            expect(result).toEqual(
                expect.objectContaining({
                    pagination: {
                        currentRecords: 10,
                        totalRecords: 10,
                        currentPage: 1,
                        totalPages: 1,
                        nextPage: null,
                        prevPage: null,
                    },
                    users: mockFetchRows,
                }),
            );
        });

        it('should return user data with role admin, member level premium, and sort by full name descending', async () => {
            const mockParams = {
                page: 2,
                limit: 10,
                sort: '-fullName',
                role: 'admin',
                level: 'premium',
            };
            const mockFetchCount = 20;
            const mockFetchRows = [
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
                { mock: 'mock' },
            ];

            User.findAndCountAll.mockResolvedValue({
                count: mockFetchCount,
                rows: mockFetchRows,
            });

            const result = await UserService.getMany(mockParams);

            expect(User.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        role: 'Admin',
                        memberLevel: 'Premium',
                    },
                    limit: mockParams.limit,
                    offset: (mockParams.page - 1) * mockParams.limit,
                    order: [['fullName', 'DESC']],
                    attributes: {
                        exclude: ['hashedPassword'],
                    },
                }),
            );
            expect(result).toEqual(
                expect.objectContaining({
                    pagination: {
                        currentRecords: 10,
                        totalRecords: 20,
                        currentPage: 2,
                        totalPages: 2,
                        nextPage: null,
                        prevPage: 1,
                    },
                    users: mockFetchRows,
                }),
            );
        });

        it('should return empty user data when trying to access out of bound page', async () => {
            const mockParams = {
                page: 5,
                limit: 10,
                sort: 'id',
                role: 'all',
                level: 'all',
            };
            const mockFetchCount = 10;
            const mockFetchRows = [];

            User.findAndCountAll.mockResolvedValue({
                count: mockFetchCount,
                rows: mockFetchRows,
            });

            const result = await UserService.getMany(mockParams);

            expect(User.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                    limit: mockParams.limit,
                    offset: (mockParams.page - 1) * mockParams.limit,
                    order: [['id', 'ASC']],
                    attributes: {
                        exclude: ['hashedPassword'],
                    },
                }),
            );
            expect(result).toEqual(
                expect.objectContaining({
                    pagination: {
                        currentRecords: 0,
                        totalRecords: 10,
                        currentPage: 5,
                        totalPages: 1,
                        nextPage: null,
                        prevPage: null,
                    },
                    users: mockFetchRows,
                }),
            );
        });
    });
});
