/* eslint-disable no-undef */
jest.mock('../../src/utils/mailer');
const request = require('supertest');
const { fakerID_ID: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const { User } = require('../../src/db/models');
const AuthService = require('../../src/services/auth.service');
const { verify } = require('../../src/utils/jwtHelper');
const jwtOptions = require('../../src/configs/jsonwebtoken');
const mailer = require('../../src/utils/mailer');
const { randomBytes, createHash } = require('crypto');

describe('Authentication Integration Test', () => {
    const mockUserPassword = 'password123';
    let users, tokens;

    beforeAll(() => {
        //
    });

    afterAll(async () => {
        server.close();
        jest.useRealTimers();
        await sequelize.close();
        await redisClient.close();
    });

    beforeEach(async () => {
        users = {
            user: await userFactory({ role: 'User' }, mockUserPassword),
            admin: await userFactory({ role: 'Admin' }, mockUserPassword),
        };

        tokens = {
            valid: (
                await AuthService.login({
                    email: users.user.email,
                    password: mockUserPassword,
                })
            ).accessToken,
            revoked: (
                await AuthService.login({
                    email: users.user.email,
                    password: mockUserPassword,
                })
            ).accessToken,
            expired: jwt.sign(
                {
                    sub: users.user.id,
                    admin: false,
                    jti: uuidv4(),
                },
                process.env.JWT_SECRET_KEY,
                {
                    ...jwtOptions.sign,
                    expiresIn: 0,
                },
            ),
            tempered: jwt.sign(
                {
                    sub: users.user.id,
                    admin: false,
                    unregisteredField: 'TEMPERED',
                    jti: uuidv4(),
                },
                process.env.JWT_SECRET_KEY,
                {
                    ...jwtOptions.sign,
                    expiresIn: '7d',
                },
            ),
        };

        await AuthService.logout(verify(tokens.revoked));
    });

    afterEach(async () => {
        await truncate();
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should return 201 and successfully registered a new user account', async () => {
            const mockData = {
                email: faker.internet.email(),
                password: faker.internet.password({
                    length: faker.number.int({
                        min: 8,
                        max: 72,
                    }),
                }),
                fullName: faker.person.fullName(),
            };

            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(mockData);

            expect(response.status).toBe(201);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(true);
            expect(statusCode).toBe(201);
            expect(message).toBe('Successfully registered a new user account.');
            expect(data).toHaveProperty('user');
            expect(data.user).toEqual({
                id: expect.any(Number),
                email: mockData.email,
                fullName: mockData.fullName,
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
            expect(errors).toBeNull();
        });

        it('should return 400 if invalid request body', async () => {
            const mockData = {
                email: faker.person.fullName(),
                fullName: faker.number.float(),
            };

            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(mockData);

            expect(response.status).toBe(400);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(false);
            expect(statusCode).toBe(400);
            expect(message).toBe('Validation error.');
            expect(data).toBeNull();
            expect(errors).toMatchObject([
                {
                    message: '"fullName" must be a string',
                    context: {
                        key: 'fullName',
                        value: mockData.fullName,
                    },
                },
                {
                    message: '"email" must be a valid email',
                    context: {
                        key: 'email',
                        value: mockData.email,
                    },
                },
                {
                    message: '"password" is required',
                    context: {
                        key: 'password',
                    },
                },
            ]);
        });

        it('should return 409 if user already exist', async () => {
            const existingUser = await userFactory();
            const mockData = {
                email: existingUser.email,
                password: existingUser.hashedPassword,
                fullName: existingUser.fullName,
            };

            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(mockData);

            expect(response.status).toBe(409);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(false);
            expect(statusCode).toBe(409);
            expect(message).toBe('Resource conflict.');
            expect(data).toBeNull();
            expect(errors).toMatchObject([
                {
                    message: 'email is already registered.',
                    context: {
                        key: 'email',
                        value: mockData.email,
                    },
                },
            ]);
        });

        it('should return 415 if request headers Content-Type is not application/json', async () => {
            const response = await request(server)
                .post('/api/v1/auth/register')
                .set('Content-Type', 'multipart/form-data')
                .send();

            expect(response.status).toBe(415);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 415,
                    data: null,
                    message: 'Unsupported Media Type.',
                    errors: [
                        {
                            message:
                                'Content-Type headers must be application/json',
                            context: {
                                key: 'Content-Type',
                                value: 'multipart/form-data',
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 415 if request headers Content-Type is not specified', async () => {
            const response = await request(server)
                .post('/api/v1/auth/register')
                .send();

            expect(response.status).toBe(415);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 415,
                    data: null,
                    message: 'Unsupported Media Type.',
                    errors: [
                        {
                            message:
                                'Content-Type headers must be application/json',
                            context: {
                                key: 'Content-Type',
                                value: null,
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 500 if server encounters an internal error', async () => {
            const mockData = {
                email: faker.internet.email(),
                password: faker.internet.password({
                    length: faker.number.int({
                        min: 8,
                        max: 72,
                    }),
                }),
                fullName: faker.person.fullName(),
            };

            const originalCreate = User.create;
            User.create = jest
                .fn()
                .mockRejectedValue(new Error('Database connection lost'));

            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(mockData);

            User.create = originalCreate;

            expect(response.status).toBe(500);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(false);
            expect(statusCode).toBe(500);
            expect(message).toBe('There is an issue with the server.');
            expect(data).toBeNull();
            expect(errors).toBeNull();
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should return 200 and successfully signed as User a JWT access token', async () => {
            const mockPassword = 'mockpassword123';
            const hashedPassword = await bcrypt.hash(mockPassword, 10);

            const mockUser = await userFactory({ hashedPassword });
            const mockReqBody = {
                email: mockUser.email,
                password: mockPassword,
            };

            const response = await request(server)
                .post('/api/v1/auth/login')
                .send(mockReqBody);

            expect(response.status).toBe(200);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(true);
            expect(statusCode).toBe(200);
            expect(message).toBe('Successfully logged in.');
            expect(data).toHaveProperty('accessToken');
            expect(data.accessToken).toBeDefined();
            expect(errors).toBeNull();
        });

        it('should return 200 and successfully signed as Admin a JWT access token', async () => {
            const mockPassword = 'mockpassword123';
            const hashedPassword = await bcrypt.hash(mockPassword, 10);

            const mockUser = await userFactory({
                hashedPassword,
                role: 'Admin',
            });
            const mockReqBody = {
                email: mockUser.email,
                password: mockPassword,
            };

            const response = await request(server)
                .post('/api/v1/auth/login')
                .send(mockReqBody);

            expect(response.status).toBe(200);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(true);
            expect(statusCode).toBe(200);
            expect(message).toBe('Successfully logged in.');
            expect(data).toHaveProperty('accessToken');
            expect(data.accessToken).toBeDefined();
            expect(errors).toBeNull();
        });

        it('should return 400 if invalid request body', async () => {
            const mockReqBody = {
                email: 'invalid-email',
                password: 0.696,
            };

            const response = await request(server)
                .post('/api/v1/auth/login')
                .send(mockReqBody);

            expect(response.status).toBe(400);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(false);
            expect(statusCode).toBe(400);
            expect(message).toBe('Validation error.');
            expect(data).toBeNull();
            expect(errors).toMatchObject([
                {
                    message: '"email" must be a valid email',
                    context: {
                        key: 'email',
                        value: mockReqBody.email,
                    },
                },
                {
                    message: '"password" must be a string',
                    context: {
                        key: 'password',
                        value: mockReqBody.password,
                    },
                },
            ]);
        });

        it('should return 401 if invalid login credentials', async () => {
            const mockPassword = 'mockpassword123';
            const hashedPassword = await bcrypt.hash(mockPassword, 10);

            const mockUser = await userFactory({ hashedPassword });
            const mockReqBody = {
                email: mockUser.email,
                password: 'wrong!' + mockPassword,
            };

            const response = await request(server)
                .post('/api/v1/auth/login')
                .send(mockReqBody);

            expect(response.status).toBe(401);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(false);
            expect(statusCode).toBe(401);
            expect(message).toBe('Unauthorized.');
            expect(data).toBeNull();
            expect(errors).toMatchObject([
                {
                    message: 'Wrong email or password.',
                    context: {
                        key: 'email',
                        value: mockReqBody.email,
                    },
                },
                {
                    message: 'Wrong email or password.',
                    context: {
                        key: 'password',
                        value: '*'.repeat(mockReqBody.password.length),
                    },
                },
            ]);
        });

        it('should return 415 if request headers Content-Type is not application/json', async () => {
            const response = await request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'multipart/form-data')
                .send();

            expect(response.status).toBe(415);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 415,
                    data: null,
                    message: 'Unsupported Media Type.',
                    errors: [
                        {
                            message:
                                'Content-Type headers must be application/json',
                            context: {
                                key: 'Content-Type',
                                value: 'multipart/form-data',
                            },
                        },
                    ],
                }),
            );
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('should return 200 and successfully revoked a JWT access token', async () => {
            const response = await request(server)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${tokens.valid}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully logged out.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should return 401 when token is invalid', async () => {
            const response = await request(server)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Basic whatdahelll`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 401,
                    message: 'Unauthorized.',
                    data: null,
                    errors: [
                        {
                            message: 'Invalid or expired token.',
                            context: {
                                key: 'request.headers.authorization',
                                value: null,
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 401 when token is expired', async () => {
            const response = await request(server)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${tokens.expired}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 401,
                    message: 'Unauthorized.',
                    data: null,
                    errors: [
                        {
                            message: 'Invalid or expired token.',
                            context: {
                                key: 'request.headers.authorization',
                                value: null,
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 401 when token is already revoked', async () => {
            const response = await request(server)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${tokens.revoked}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 401,
                    message: 'Unauthorized.',
                    data: null,
                    errors: [
                        {
                            message: 'Invalid or expired token.',
                            context: {
                                key: 'request.headers.authorization',
                                value: null,
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 401 when token is tempered', async () => {
            const response = await request(server)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${tokens.tempered}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 401,
                    message: 'Unauthorized.',
                    data: null,
                    errors: [
                        {
                            message: 'Invalid or expired token.',
                            context: {
                                key: 'request.headers.authorization',
                                value: null,
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 500 if redis client fails', async () => {
            const originalSet = redisClient.set;
            redisClient.set = jest
                .fn()
                .mockRejectedValue(new Error('Redis connection lost'));

            const response = await request(server)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${tokens.valid}`);

            redisClient.set = originalSet;

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 500,
                    message: 'There is an issue with the server.',
                    data: null,
                    errors: null,
                }),
            );
        });
    });

    describe('POST /api/v1/auth/forgot-password', () => {
        it('should return 200 and successfully sent password reset link', async () => {
            const mockReqBody = {
                email: users.user.email,
            };

            const response = await request(server)
                .post('/api/v1/auth/forgot-password')
                .send(mockReqBody);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message:
                        'Successfully sent password reset link to your email.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should return 200 when email is not registered', async () => {
            const mockReqBody = {
                email: 'unregistered@mail.com',
            };

            const response = await request(server)
                .post('/api/v1/auth/forgot-password')
                .send(mockReqBody);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message:
                        'Successfully sent password reset link to your email.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should return 400 when email is invalid', async () => {
            const mockReqBody = {
                email: 'invalid-mail.com',
            };

            const response = await request(server)
                .post('/api/v1/auth/forgot-password')
                .send(mockReqBody);

            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 400,
                    data: null,
                    message: 'Validation error.',
                    errors: [
                        {
                            message: '"email" must be a valid email',
                            context: {
                                key: 'email',
                                value: mockReqBody.email,
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 415 if request headers Content-Type is not application/json', async () => {
            const response = await request(server)
                .post('/api/v1/auth/forgot-password')
                .set('Content-Type', 'multipart/form-data')
                .send();

            expect(response.status).toBe(415);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 415,
                    data: null,
                    message: 'Unsupported Media Type.',
                    errors: [
                        {
                            message:
                                'Content-Type headers must be application/json',
                            context: {
                                key: 'Content-Type',
                                value: 'multipart/form-data',
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 500 when mailer fails', async () => {
            mailer.mockRejectedValue(new Error('Mailer service is down'));

            const response = await request(server)
                .post('/api/v1/auth/forgot-password')
                .send({ email: users.user.email });

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 500,
                    message: 'There is an issue with the server.',
                    data: null,
                    errors: null,
                }),
            );
        });
    });

    describe('POST /api/v1/auth/reset-password', () => {
        it('should return 200 and successfully reset user password', async () => {
            const token = randomBytes(32).toString('hex');
            const hashedToken = createHash('sha256')
                .update(token)
                .digest('hex');
            await redisClient.set(
                `user:${users.user.id}:resetPasswordToken`,
                hashedToken,
                {
                    expiration: {
                        type: 'EX',
                        value: 900,
                    },
                },
            );

            const newPassword = 'newStrongPassword123';
            const mockReqBody = {
                userId: users.user.id,
                token,
                newPassword,
                confirmNewPassword: newPassword,
            };

            const response = await request(server)
                .post('/api/v1/auth/reset-password')
                .send(mockReqBody);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully reset your password.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should return 400 with invalid request body', async () => {
            const mockReqBody = {
                userId: 'not a number',
                token: 'not a hex string',
                newPassword: 'short',
                confirmNewPassword: 'short',
            };

            const response = await request(server)
                .post('/api/v1/auth/reset-password')
                .send(mockReqBody);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.statusCode).toBe(400);
            expect(response.body.message).toBe('Validation error.');
            expect(response.body.errors.length).toBe(4);
        });

        it('should return 400 with invalid token', async () => {
            const newPassword = 'newStrongPassword123';
            const mockReqBody = {
                userId: users.user.id,
                token: 'c0ae8bc1c8ad1eea5d936c622a6850b984459d5bfd999552dc4cbecb54d02efe',
                newPassword,
                confirmNewPassword: newPassword,
            };

            const response = await request(server)
                .post('/api/v1/auth/reset-password')
                .send(mockReqBody);

            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 400,
                    message: 'Validation error.',
                    errors: [
                        {
                            message: '"token" is invalid or expired',
                            context: {
                                key: 'token',
                                value: '*'.repeat(mockReqBody.token.length),
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 404 when user does not exist', async () => {
            const token = randomBytes(32).toString('hex');
            const hashedToken = createHash('sha256')
                .update(token)
                .digest('hex');
            await redisClient.set(
                `user:${users.user.id}:resetPasswordToken`,
                hashedToken,
                {
                    expiration: {
                        type: 'EX',
                        value: 900,
                    },
                },
            );

            const newPassword = 'newpassword';
            const mockReqBody = {
                userId: users.user.id,
                token,
                newPassword,
                confirmNewPassword: newPassword,
            };

            await User.destroy({
                where: {
                    id: users.user.id,
                },
            });

            const response = await request(server)
                .post('/api/v1/auth/reset-password')
                .send(mockReqBody);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 404,
                    message: 'Resource not found.',
                    errors: [
                        {
                            message: 'User with "userId" does not exist',
                            context: {
                                key: 'userId',
                                value: mockReqBody.userId,
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 415 if request headers Content-Type is not application/json', async () => {
            const response = await request(server)
                .post('/api/v1/auth/reset-password')
                .set('Content-Type', 'multipart/form-data')
                .send();

            expect(response.status).toBe(415);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 415,
                    data: null,
                    message: 'Unsupported Media Type.',
                    errors: [
                        {
                            message:
                                'Content-Type headers must be application/json',
                            context: {
                                key: 'Content-Type',
                                value: 'multipart/form-data',
                            },
                        },
                    ],
                }),
            );
        });
    });
});
