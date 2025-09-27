/* eslint-disable no-undef */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const feedbackFactory = require('../../src/db/seeders/factories/feedback');
const AuthService = require('../../src/services/auth.service');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const jwtOptions = require('../../src/configs/jsonwebtoken');
const { verify } = require('../../src/utils/jwtHelper');

describe('Feedback Management Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens;
    let userArrays = [],
        adminArrays = [];

    afterAll(async () => {
        server.close();
        await sequelize.close();
        await redisClient.close();
    });

    beforeEach(async () => {
        userArrays = [];
        adminArrays = [];

        for (let i = 0; i < 7; i++) {
            userArrays.push(
                await userFactory({ role: 'User' }, mockUserPassword),
            );

            adminArrays.push(
                await userFactory({ role: 'Admin' }, mockUserPassword),
            );
        }

        for (let i = 0; i < 15; i++) {
            await feedbackFactory();
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

    describe('GET /api/v1/feedbacks', () => {
        it('should return 200 and fetches all feedback data with default query params', async () => {
            const response = await request(server)
                .get('/api/v1/feedbacks')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all feedbacks.',
                    data: {
                        feedbacks: expect.any(Array),
                    },
                    pagination: {
                        currentRecords: 10,
                        totalRecords: 15,
                        currentPage: 1,
                        totalPages: 2,
                        nextPage: 2,
                        prevPage: null,
                    },
                    errors: null,
                }),
            );
        });

        it('should return 200 and fetches all feedback data with query params', async () => {
            const response = await request(server)
                .get('/api/v1/feedbacks?sort=-createdAt&limit=5&page=2')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all feedbacks.',
                    data: {
                        feedbacks: expect.any(Array),
                    },
                    pagination: {
                        currentRecords: 5,
                        totalRecords: 15,
                        currentPage: 2,
                        totalPages: 3,
                        nextPage: 3,
                        prevPage: 1,
                    },
                    errors: null,
                }),
            );
        });

        it('should return 200 and fetches empty feedbacks with out of bound page number', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/feedbacks?sort=-createdAt&limit=5&page=100&email=johndoe@mail.com',
                )
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.feedbacks.length).toBe(0);
        });

        it('should return 400 with invalid query params', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/feedbacks?sort=-id&limit=0&page=0&email=inivalid-email',
                )
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 400,
                    data: null,
                    message: 'Validation error.',
                    errors: expect.any(Array),
                }),
            );
        });

        it('should return 401 when no authorization token is provided', async () => {
            const response = await request(server).get('/api/v1/feedbacks');

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

        it('should return 403 with user access token', async () => {
            const response = await request(server)
                .get('/api/v1/feedbacks')
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

    describe('GET /api/v1/feedbacks/:feedbackId', () => {
        it('should return 200 and fetches feedback data', async () => {
            const response = await request(server)
                .get('/api/v1/feedbacks/1')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved a feedback details.',
                    data: {
                        feedback: expect.any(Object),
                    },
                    errors: null,
                }),
            );
        });

        it('should return 400 with invalid path params', async () => {
            const response = await request(server)
                .get('/api/v1/feedbacks/abc')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 400,
                    data: null,
                    message: 'Validation error.',
                    errors: [
                        {
                            message: '"value" must be a number',
                            context: {
                                value: 'abc',
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 401 with invalid access token', async () => {
            const response = await request(server).get('/api/v1/feedbacks/1');

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

        it('should return 403 with user access token', async () => {
            const response = await request(server)
                .get('/api/v1/feedbacks/1')
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

        it('should return 404 when feedback does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/feedbacks/404')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 404,
                    data: null,
                    message: 'Resource not found.',
                    errors: [
                        {
                            message:
                                'Feedback with "feedbackId" does not exist',
                            context: {
                                key: 'feedbackId',
                                value: 404,
                            },
                        },
                    ],
                }),
            );
        });
    });
});
