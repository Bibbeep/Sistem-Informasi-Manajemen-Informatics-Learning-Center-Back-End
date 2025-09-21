/* eslint-disable no-undef */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const { server } = require('../../src/server');
const { verify } = require('../../src/utils/jwtHelper');
const AuthService = require('../../src/services/auth.service');
const jwtOptions = require('../../src/configs/jsonwebtoken');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');

describe('User Management Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens;
    let userArrays = [],
        adminArrays = [];

    beforeAll(() => {
        //
    });

    afterAll(async () => {
        server.close();
        await sequelize.close();
        await redisClient.close();
    });

    beforeEach(async () => {
        userArrays = [];
        adminArrays = [];

        for (let i = 0; i < 10; i++) {
            userArrays.push(
                await userFactory({ role: 'User' }, mockUserPassword),
            );

            adminArrays.push(
                await userFactory({ role: 'Admin' }, mockUserPassword),
            );
        }

        users = {
            user: userArrays,
            admin: adminArrays,
        };

        tokens = {
            validUser: (
                await AuthService.login({
                    email: users.user[0].email,
                    password: mockUserPassword,
                })
            ).accessToken,
            validAdmin: (
                await AuthService.login({
                    email: users.admin[0].email,
                    password: mockUserPassword,
                })
            ).accessToken,
            revoked: (
                await AuthService.login({
                    email: users.user[0].email,
                    password: mockUserPassword,
                })
            ).accessToken,
            expired: jwt.sign(
                {
                    sub: users.user[0].id,
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
                    sub: users.user[0].id,
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

    describe('GET /api/v1/users', () => {
        it('should return 200 and fetches all user data with filter role user and member level premium', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/users?role=user&level=premium&sort=-fullName&limit=10&page=2',
                )
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('statusCode', 200);
            expect(response.body).toHaveProperty(
                'message',
                'Successfully retrieved all user data.',
            );
            expect(response.body).toHaveProperty('data.users');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body).toHaveProperty('errors', null);
        });

        it('should return 200 and fetches all user data with filter role admin and member level basic', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/users?role=admin&level=basic&sort=-fullName&limit=10&page=1',
                )
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('statusCode', 200);
            expect(response.body).toHaveProperty(
                'message',
                'Successfully retrieved all user data.',
            );
            expect(response.body).toHaveProperty('data.users');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body).toHaveProperty('errors', null);
        });

        it('should return 200 and fetches empty user data without of bound page number', async () => {
            const response = await request(server)
                .get('/api/v1/users?limit=10&page=100')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('statusCode', 200);
            expect(response.body).toHaveProperty(
                'message',
                'Successfully retrieved all user data.',
            );
            expect(response.body).toHaveProperty('data.users');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body).toHaveProperty('errors', null);
            expect(response.body.data.users.length).toBe(0);
        });

        it('should return 200 and fetches all user data without query parameter', async () => {
            const response = await request(server)
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('statusCode', 200);
            expect(response.body).toHaveProperty(
                'message',
                'Successfully retrieved all user data.',
            );
            expect(response.body).toHaveProperty('data.users');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body).toHaveProperty('errors', null);
        });

        it('should return 400 when invalid query parameter', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/users?role=123&level=123&sort=whoami&limit=0&page=0',
                )
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 400,
                    data: null,
                    message: 'Request body validation error.',
                    errors: [
                        {
                            message: '"page" must be a positive number',
                            context: {
                                key: 'page',
                                value: 0,
                            },
                        },
                        {
                            message: '"limit" must be a positive number',
                            context: {
                                key: 'limit',
                                value: 0,
                            },
                        },
                        {
                            message:
                                '"sort" with value "whoami" fails to match the required pattern: /^-?(id|fullName|createdAt)$/',
                            context: {
                                key: 'sort',
                                value: 'whoami',
                            },
                        },
                        {
                            message: '"role" must be one of [user, admin, all]',
                            context: {
                                key: 'role',
                                value: '123',
                            },
                        },
                        {
                            message:
                                '"level" must be one of [basic, premium, all]',
                            context: {
                                key: 'level',
                                value: '123',
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 401 when no authorization token provided', async () => {
            const response = await request(server).get(
                '/api/v1/users?role=user&level=premium&sort=-fullName&limit=10&page=2',
            );

            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 401,
                    data: null,
                    message: 'Unauthorized.',
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

        it('should return 403 when accessing with user token', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/users?role=user&level=premium&sort=-fullName&limit=10&page=2',
                )
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(403);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 403,
                    data: null,
                    message: 'Forbidden.',
                    errors: [
                        {
                            message:
                                'You do not have the necessary permissions to access this resource.',
                            context: {
                                key: 'role',
                                value: 'User',
                            },
                        },
                    ],
                }),
            );
        });
    });
});
