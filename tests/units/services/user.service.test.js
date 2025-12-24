/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
jest.mock('../../../src/services/auth.service');
jest.mock('file-type', () => {
    return {
        fromBuffer: jest.fn(),
    };
});
jest.mock('@aws-sdk/lib-storage', () => {
    return {
        Upload: jest.fn().mockImplementation(() => {
            return {
                done: jest.fn().mockResolvedValue({
                    Location: 'https://mock-s3-location.com/new-photo.webp',
                }),
            };
        }),
    };
});
jest.mock('@aws-sdk/client-s3', () => {
    return {
        DeleteObjectCommand: jest.fn(),
    };
});
jest.mock('../../../src/configs/s3', () => {
    return {
        s3: {
            send: jest.fn(),
        },
    };
});
jest.mock('sharp', () => {
    return jest.fn(() => {
        return {
            webp: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue('compressed-buffer'),
        };
    });
});
jest.mock('bcrypt', () => {
    return {
        genSalt: jest.fn(),
        hash: jest.fn(),
        compare: jest.fn(),
    };
});
const { Op, fn } = require('sequelize');
const UserService = require('../../../src/services/user.service');
const AuthService = require('../../../src/services/auth.service');
const { User } = require('../../../src/db/models');
const HTTPError = require('../../../src/utils/httpError');
const bcrypt = require('bcrypt');
const { fromBuffer } = require('file-type');
const sharp = require('sharp');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../../../src/configs/s3');

describe('User Service Unit Tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = {
            ...originalEnv,
            BUCKET_NAME: 'my-bucket',
        };

        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env = originalEnv;
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

        it('should return user data with search query parameter', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                role: 'all',
                level: 'all',
                q: 'search',
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
                        _search: {
                            [Op.match]: fn(
                                'plainto_tsquery',
                                'english',
                                mockParams.q,
                            ),
                        },
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

        it('should return a user data with email query param', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                role: 'all',
                level: 'all',
                email: 'email@email.com',
            };
            const mockFetchCount = 1;
            const mockFetchRows = new Array(1);

            User.findAndCountAll.mockResolvedValue({
                count: mockFetchCount,
                rows: mockFetchRows,
            });

            const result = await UserService.getMany(mockParams);

            expect(User.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(
                expect.objectContaining({
                    pagination: {
                        currentRecords: 1,
                        totalRecords: 1,
                        currentPage: 1,
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
            const mockTokenPayload = {
                admin: true,
                sub: 1,
            };

            User.findByPk.mockResolvedValue(mockUserData);
            const result = await UserService.getOne(
                mockTokenPayload,
                mockUserId,
            );

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
            const mockTokenPayload = {
                admin: true,
                sub: 1,
            };

            User.findByPk.mockResolvedValue(mockUserData);

            await expect(
                UserService.getOne(mockTokenPayload, mockUserId),
            ).rejects.toThrow(
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

    describe('deleteOne Tests', () => {
        it('should deletes a user as the account owner', async () => {
            const mockData = {
                userId: 1,
                tokenPayload: {
                    sub: 1,
                    exp: 111111111,
                    jti: 'mock-jti',
                },
            };
            const mockUserData = {
                id: 1,
                email: 'johndoe@mail.com',
                fullName: 'John Doe',
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: '2025-09-20T15:37:25.953Z',
                updatedAt: '2025-09-20T15:37:25.953Z',
            };
            User.findByPk.mockResolvedValue(mockUserData);
            User.destroy.mockResolvedValue(true);
            AuthService.logout.mockResolvedValue();

            await UserService.deleteOne(mockData);

            expect(User.findByPk).toHaveBeenCalledWith(mockData.userId);
            expect(User.destroy).toHaveBeenCalledWith({
                where: { id: mockData.userId },
            });
            expect(AuthService.logout).toHaveBeenCalledWith(
                mockData.tokenPayload,
            );
        });

        it('should deletes a user as the admin', async () => {
            const mockData = {
                userId: 2,
                tokenPayload: {
                    sub: 1,
                    exp: 111111111,
                    jti: 'mock-jti',
                },
            };
            const mockUserData = {
                id: 2,
                email: 'johndoe@mail.com',
                fullName: 'John Doe',
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: '2025-09-20T15:37:25.953Z',
                updatedAt: '2025-09-20T15:37:25.953Z',
            };
            User.findByPk.mockResolvedValue(mockUserData);
            User.destroy.mockResolvedValue(true);

            await UserService.deleteOne(mockData);

            expect(User.findByPk).toHaveBeenCalledWith(mockData.userId);
            expect(User.destroy).toHaveBeenCalledWith({
                where: { id: mockData.userId },
            });
        });

        it('should throw error when user does not exist', async () => {
            const mockData = {
                userId: 404,
                tokenPayload: {
                    sub: 1,
                    exp: 111111111,
                    jti: 'mock-jti',
                },
            };
            User.findByPk.mockResolvedValue(null);

            await expect(UserService.deleteOne(mockData)).rejects.toThrow(
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
    });

    describe('uploadPhoto tests', () => {
        it('should upload a new profile picture and update the user record', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                userId: 1,
            };
            const mockUser = {
                id: 1,
                pictureUrl: null,
            };
            User.findByPk.mockResolvedValue(mockUser);
            fromBuffer.mockResolvedValue({ mime: 'image/png' });

            const result = await UserService.uploadPhoto(mockData);

            expect(User.findByPk).toHaveBeenCalledWith(mockData.userId);
            expect(sharp).toHaveBeenCalledWith(mockData.file.buffer);
            expect(Upload).toHaveBeenCalledTimes(1);
            expect(User.update).toHaveBeenCalledWith(
                {
                    pictureUrl: expect.any(String),
                },
                { where: { id: mockData.userId } },
            );
            expect(s3.send).not.toHaveBeenCalled();
            expect(result).toEqual({
                pictureUrl: expect.any(String),
            });
        });

        it('should upload a new profile picture and not throw error even if failed to update to database', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                userId: 1,
            };
            const mockUser = {
                id: 1,
                pictureUrl: null,
            };
            User.findByPk.mockResolvedValue(mockUser);
            fromBuffer.mockResolvedValue({ mime: 'image/png' });
            Upload.mockImplementationOnce(() => {
                return {
                    done: jest.fn().mockResolvedValue({
                        Location: undefined,
                    }),
                };
            });

            await UserService.uploadPhoto(mockData);

            expect(User.findByPk).toHaveBeenCalledWith(mockData.userId);
            expect(sharp).toHaveBeenCalledWith(mockData.file.buffer);
            expect(Upload).toHaveBeenCalledTimes(1);
            expect(User.update).not.toHaveBeenCalled();
            expect(s3.send).not.toHaveBeenCalled();
        });

        it('should upload a new picture and delete the old one if it exists', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                userId: 1,
            };
            const mockUser = {
                id: 1,
                pictureUrl: 'https://my-bucket.com/images/old-photo.webp',
            };
            User.findByPk.mockResolvedValue(mockUser);
            fromBuffer.mockResolvedValue({ mime: 'image/jpeg' });

            await UserService.uploadPhoto(mockData);

            expect(User.findByPk).toHaveBeenCalledWith(mockData.userId);
            expect(s3.send).toHaveBeenCalledTimes(1);
            expect(DeleteObjectCommand).toHaveBeenCalledTimes(1);
            expect(User.update).toHaveBeenCalledWith(
                {
                    pictureUrl: expect.any(String),
                },
                { where: { id: mockData.userId } },
            );
        });

        it('should throw a 400 error if no file is provided', async () => {
            const mockData = { file: null, userId: 1 };

            await expect(UserService.uploadPhoto(mockData)).rejects.toThrow(
                new HTTPError(400, 'Validation error.', [
                    {
                        message: '"photo" is empty',
                        context: { key: 'photo', value: null },
                    },
                ]),
            );
        });

        it('should throw a 404 error if the user is not found', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                userId: 999,
            };
            User.findByPk.mockResolvedValue(null);

            await expect(UserService.uploadPhoto(mockData)).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'User with "userId" does not exist',
                        context: { key: 'userId', value: 999 },
                    },
                ]),
            );
        });

        it('should throw a 415 error for an unsupported file type', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                userId: 1,
            };
            const mockUser = { id: 1, pictureUrl: null };
            User.findByPk.mockResolvedValue(mockUser);
            fromBuffer.mockResolvedValue({ mime: 'application/pdf' });

            await expect(UserService.uploadPhoto(mockData)).rejects.toThrow(
                new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message:
                            'File MIME type must be "image/jpeg", "image/png", or "image/webp"',
                        context: {
                            key: 'File MIME Type',
                            value: 'application/pdf',
                        },
                    },
                ]),
            );
        });

        it('should throw a 415 error if file type cannot be determined', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                userId: 1,
            };
            const mockUser = { id: 1, pictureUrl: null };
            User.findByPk.mockResolvedValue(mockUser);
            fromBuffer.mockResolvedValue(undefined);

            await expect(UserService.uploadPhoto(mockData)).rejects.toThrow(
                new HTTPError(415, 'Unsupported Media Type.'),
            );
        });
    });
});
