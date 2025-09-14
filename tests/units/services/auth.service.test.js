/* eslint-disable no-undef */
jest.mock('bcrypt');
jest.mock('../../../src/db/models/user');
jest.mock('../../../src/utils/jwtHelper');
jest.mock('jsonwebtoken');
jest.mock('uuid');
jest.mock('../../../src/configs/redis');

const { fakerID_ID: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const AuthService = require('../../../src/services/auth.service');
const User = require('../../../src/db/models/user');
const HTTPError = require('../../../src/utils/httpError');
const { sign } = require('../../../src/utils/jwtHelper');
const { redisClient } = require('../../../src/configs/redis');

describe('Authentication Service Unit Tests', () => {
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(
            new Date('2025-12-05T00:00:00.000Z'),
        );
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
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
            const mockjti = 'mocked-jti-uuid-string';
            const mockAccessToken = 'jwt-access-token';

            User.findOne.mockResolvedValue(mockUserData);
            bcrypt.compare.mockResolvedValue(true);
            uuidv4.mockReturnValue(mockjti);
            sign.mockReturnValue(mockAccessToken);

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
            expect(sign).toHaveBeenCalledWith({
                sub: mockUserData.id,
                admin: false,
                jti: mockjti,
            });
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
            const mockjti = 'mocked-jti-uuid-string';
            const mockAccessToken = 'jwt-access-token';

            User.findOne.mockResolvedValue(mockUserData);
            bcrypt.compare.mockResolvedValue(true);
            uuidv4.mockReturnValue(mockjti);
            sign.mockReturnValue(mockAccessToken);

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
            expect(sign).toHaveBeenCalledWith({
                sub: mockUserData.id,
                admin: true,
                jti: mockjti,
            });
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

    describe('logout Tests', () => {
        it('should revoke access token', async () => {
            const mockJWTClaim = {
                sub: 1,
                exp: Math.floor(new Date('2025-12-12T00:00:00.000Z') / 1000),
                jti: 'mock-jti-value',
            };
            const mockttl =
                mockJWTClaim.exp -
                Math.floor(new Date('2025-12-05T00:00:00.000Z') / 1000);
            const mockLogoutTime = new Date(
                '2025-12-05T00:00:00.000Z',
            ).toISOString();
            redisClient.setEx.mockResolvedValue('OK');

            await AuthService.logout(mockJWTClaim);

            expect(redisClient.setEx).toHaveBeenCalledWith(
                `user:${mockJWTClaim.sub}:JWT:${mockJWTClaim.jti}:logoutAt`,
                mockttl,
                mockLogoutTime,
            );
            expect(AuthService.logout(mockJWTClaim)).resolves.not.toThrow();
        });
    });
});
