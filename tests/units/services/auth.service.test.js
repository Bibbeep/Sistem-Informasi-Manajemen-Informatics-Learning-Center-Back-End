/* eslint-disable no-undef */
const { fakerID_ID: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthService = require('../../../src/services/auth.service');
const User = require('../../../src/db/models/user');
const HTTPError = require('../../../src/utils/httpError');

jest.mock('bcrypt');
jest.mock('../../../src/db/models/user');
jest.mock('jsonwebtoken');

describe('Authentication Service Unit Tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env.JWT_SECRET = 'mock-jwt-secret';
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = originalEnv;
    });

    describe('register Tests', () => {
        it('should create a new user and return user data', async () => {
            const mockUserData = {
                email: faker.internet.email(),
                password: faker.internet.password({
                    length: faker.number.int({ min: 8, max: 72 }),
                }),
                fullName: faker.person.fullName(),
            };

            const mockDate = faker.date.recent();
            const mockReturnData = {
                id: 1,
                email: mockUserData.email,
                fullName: mockUserData.fullName,
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const hashedPassword = 'hashed password';

            User.findOne.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue(hashedPassword);
            User.create.mockResolvedValue({
                id: mockReturnData.id,
                email: mockReturnData.email,
                fullName: mockReturnData.fullName,
                hashedPassword: hashedPassword,
                memberLevel: mockReturnData.memberLevel,
                role: mockReturnData.role,
                pictureUrl: mockReturnData.pictureUrl,
                createdAt: mockReturnData.createdAt,
                updatedAt: mockReturnData.updatedAt,
            });

            const result = await AuthService.register(mockUserData);

            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: mockUserData.email },
            });
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith(
                mockUserData.password,
                'salt',
            );
            expect(User.create).toHaveBeenCalledWith({
                email: mockUserData.email,
                hashedPassword,
                fullName: mockUserData.fullName,
                memberLevel: mockReturnData.memberLevel,
                role: mockReturnData.role,
            });
            expect(result).toEqual({ user: mockReturnData });
        });

        it('should throw error if user already exists', async () => {
            const mockData = {
                email: faker.internet.email(),
                password: faker.internet.password({
                    length: faker.number.int({ min: 8, max: 72 }),
                }),
                fullName: faker.person.fullName(),
            };

            const mockDate = faker.date.recent();
            const mockUserData = {
                id: 1,
                email: mockData.email,
                fullName: mockData.fullName,
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            User.findOne.mockResolvedValue({
                id: mockUserData.id,
                email: mockUserData.email,
                fullName: mockUserData.fullName,
                hashedPassword: 'hashed password',
                memberLevel: mockUserData.memberLevel,
                role: mockUserData.role,
                pictureUrl: mockUserData.pictureUrl,
                createdAt: mockUserData.createdAt,
                updatedAt: mockUserData.updatedAt,
            });

            await expect(AuthService.register(mockData)).rejects.toThrow(
                new HTTPError(409, 'Resource conflict.', [
                    {
                        message: 'email is already registered.',
                        context: {
                            key: 'email',
                            value: mockUserData.email,
                        },
                    },
                ]),
            );

            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: mockData.email },
            });
        });
    });

    describe('login Tests', () => {
        it('should sign an access token for role "User" and return it', async () => {
            const mockDate = new Date(
                2025,
                12,
                12,
                12,
                12,
                12,
                12,
                0,
            ).toISOString();
            const mockLoginCredential = {
                email: 'johndoe@mail.com',
                password: 'Password123',
            };
            const mockUserData = {
                id: 1,
                email: mockLoginCredential.email,
                hashedPassword: 'hashed password',
                fullName: 'John Doe',
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: 'https://picture.url/999',
                createdAt: mockDate,
                updatedAt: mockDate,
            };
            const mockAccessToken = 'jwt-access-token';

            User.findOne.mockResolvedValue(mockUserData);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue(mockAccessToken);

            const result = await AuthService.login(mockLoginCredential);

            expect(User.findOne).toHaveBeenCalledWith({
                where: {
                    email: mockLoginCredential.email,
                },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                mockLoginCredential.password,
                mockUserData.hashedPassword,
            );
            expect(jwt.sign).toHaveBeenCalledWith(
                { sub: mockUserData.id, admin: false },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '7d' },
            );
            expect(result).toEqual({ accessToken: mockAccessToken });
        });

        it('should sign an access token for role "Admin" and return it', async () => {
            const mockDate = new Date(
                2025,
                12,
                12,
                12,
                12,
                12,
                12,
                0,
            ).toISOString();
            const mockLoginCredential = {
                email: 'johndoe@mail.com',
                password: 'Password123',
            };
            const mockUserData = {
                id: 1,
                email: mockLoginCredential.email,
                hashedPassword: 'hashed password',
                fullName: 'John Doe',
                memberLevel: 'Basic',
                role: 'Admin',
                pictureUrl: 'https://picture.url/999',
                createdAt: mockDate,
                updatedAt: mockDate,
            };
            const mockAccessToken = 'jwt-access-token';

            User.findOne.mockResolvedValue(mockUserData);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue(mockAccessToken);

            const result = await AuthService.login(mockLoginCredential);

            expect(User.findOne).toHaveBeenCalledWith({
                where: {
                    email: mockLoginCredential.email,
                },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                mockLoginCredential.password,
                mockUserData.hashedPassword,
            );
            expect(jwt.sign).toHaveBeenCalledWith(
                { sub: mockUserData.id, admin: true },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '7d' },
            );
            expect(result).toEqual({ accessToken: mockAccessToken });
        });

        it('should throw error if user with given email does not exist', async () => {
            const mockUserCredential = {
                email: 'johndoe@mail.com',
                password: 'Password123',
            };

            User.findOne.mockResolvedValue(null);

            await expect(AuthService.login(mockUserCredential)).rejects.toThrow(
                new HTTPError(401, 'Unauthorized.', [
                    {
                        message: 'Wrong email or password.',
                        context: {
                            key: 'email',
                            value: mockUserCredential.email,
                        },
                    },
                    {
                        message: 'Wrong email or password.',
                        context: {
                            key: 'password',
                            value: '*'.repeat(
                                mockUserCredential.password.length,
                            ),
                        },
                    },
                ]),
            );
            expect(User.findOne).toHaveBeenCalledWith({
                where: {
                    email: mockUserCredential.email,
                },
            });
        });

        it('should throw error if given password is incorrect', async () => {
            const mockDate = new Date(
                2025,
                12,
                12,
                12,
                12,
                12,
                12,
                0,
            ).toISOString();
            const mockLoginCredential = {
                email: 'johndoe@mail.com',
                password: 'Password123',
            };
            const mockUserData = {
                id: 1,
                email: mockLoginCredential.email,
                hashedPassword: 'hashed password',
                fullName: 'John Doe',
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: 'https://picture.url/999',
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            User.findOne.mockResolvedValue(mockUserData);
            bcrypt.compare.mockResolvedValue(false);

            await expect(
                AuthService.login(mockLoginCredential),
            ).rejects.toThrow(
                new HTTPError(401, 'Unauthorized.', [
                    {
                        message: 'Wrong email or password.',
                        context: {
                            key: 'email',
                            value: mockLoginCredential.email,
                        },
                    },
                    {
                        message: 'Wrong email or password.',
                        context: {
                            key: 'password',
                            value: '*'.repeat(
                                mockLoginCredential.password.length,
                            ),
                        },
                    },
                ]),
            );
            expect(bcrypt.compare).toHaveBeenCalledWith(
                mockLoginCredential.password,
                mockUserData.hashedPassword,
            );
        });
    });
});
