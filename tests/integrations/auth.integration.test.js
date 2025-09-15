/* eslint-disable no-undef */
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
const User = require('../../src/db/models/user');
const AuthService = require('../../src/services/auth.service');
const { verify } = require('../../src/utils/jwtHelper');
const jwtOptions = require('../../src/configs/jsonwebtoken');

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
            expect(message).toBe('Request body validation error.');
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
            expect(message).toBe('Request body validation error.');
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
    });
});
