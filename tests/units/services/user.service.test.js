/* eslint-disable no-undef */
jest.mock('../../../src/db/models/user');
jest.mock('bcrypt', () => {
    return {
        genSalt: jest.fn(),
        hash: jest.fn(),
        compare: jest.fn(),
    };
});
const UserService = require('../../../src/services/user.service');
const User = require('../../../src/db/models/user');
const HTTPError = require('../../../src/utils/httpError');
const bcrypt = require('bcrypt');

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

    describe('getOne Tests', () => {
        it('should fetches user data', async () => {
            const mockUserId = 1;
            const mockUserData = {
                id: 1,
                email: 'johndoe@mail.com',
                hashedPassword: 'hashedpassword',
                fullName: 'John Doe',
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: '2025-09-20T15:37:25.953Z',
                updatedAt: '2025-09-20T15:37:25.953Z',
            };

            User.findByPk.mockResolvedValue(mockUserData);

            const result = await UserService.getOne(mockUserId);

            expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
            expect(result).toEqual(
                expect.objectContaining({
                    id: 1,
                    email: 'johndoe@mail.com',
                    fullName: 'John Doe',
                    memberLevel: 'Basic',
                    role: 'User',
                    pictureUrl: null,
                    createdAt: '2025-09-20T15:37:25.953Z',
                    updatedAt: '2025-09-20T15:37:25.953Z',
                }),
            );
        });

        it('should throw error when user does not exist', async () => {
            const mockUserId = 404;
            const mockUserData = null;

            User.findByPk.mockResolvedValue(mockUserData);

            await expect(UserService.getOne(mockUserId)).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'User with "userId" does not exist',
                        context: {
                            key: 'userId',
                            value: mockUserId,
                        },
                    },
                ]),
            );

            expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('updateOne Tests', () => {
        it('should updates user data with fullName, email, password', async () => {
            const mockData = {
                userId: 1,
                fullName: 'John Doe',
                email: 'johndoe@mail.com',
                password: 'password',
            };

            const mockUpdateData = {
                fullName: mockData.fullName,
                email: mockData.email,
                hashedPassword: 'hashed-password',
            };

            const mockReturnData = {
                id: 1,
                email: 'johndoe@mail.com',
                fullName: 'John Doe',
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: 'NOW',
                updatedAt: 'NOW',
            };

            User.findByPk.mockResolvedValue(true);
            const mockSalt = 'salt';
            bcrypt.genSalt.mockResolvedValue(mockSalt);
            bcrypt.hash.mockResolvedValue(mockUpdateData.hashedPassword);
            User.update.mockResolvedValue([1, [mockReturnData]]);

            const result = await UserService.updateOne(mockData);

            expect(User.findByPk).toHaveBeenCalledWith(mockData.userId);
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith(
                mockData.password,
                mockSalt,
            );
            expect(User.update).toHaveBeenCalledWith(mockUpdateData, {
                where: {
                    id: mockData.userId,
                },
                returning: true,
            });

            expect(result).toEqual(mockReturnData);
        });

        it('should throw not found error', async () => {
            const mockData = {
                userId: 404,
                fullName: 'John Doe',
                email: 'johndoe@mail.com',
                password: 'password',
            };

            User.findByPk.mockResolvedValue(false);

            await expect(UserService.updateOne(mockData)).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'User with "userId" does not exist',
                        context: {
                            key: 'userId',
                            value: mockData.userId,
                        },
                    },
                ]),
            );

            expect(User.findByPk).toHaveBeenCalledWith(mockData.userId);
        });

        it('should updates user data without password', async () => {
            const mockData = {
                userId: 1,
                fullName: 'John Doe',
                email: 'johndoe@mail.com',
            };

            const mockUpdateData = {
                fullName: mockData.fullName,
                email: mockData.email,
            };

            const mockReturnData = {
                id: 1,
                email: 'johndoe@mail.com',
                fullName: 'John Doe',
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: 'NOW',
                updatedAt: 'NOW',
            };

            User.findByPk.mockResolvedValue(true);
            User.update.mockResolvedValue([1, [mockReturnData]]);

            const result = await UserService.updateOne(mockData);

            expect(User.findByPk).toHaveBeenCalledWith(mockData.userId);
            expect(User.update).toHaveBeenCalledWith(mockUpdateData, {
                where: {
                    id: mockData.userId,
                },
                returning: true,
            });

            expect(result).toEqual(mockReturnData);
        });
    });
});
