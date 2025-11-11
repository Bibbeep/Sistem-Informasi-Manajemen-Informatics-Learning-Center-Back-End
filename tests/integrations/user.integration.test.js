/* eslint-disable no-undef */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const { server } = require('../../src/server');
const { verify } = require('../../src/utils/jwtHelper');
const AuthService = require('../../src/services/auth.service');
const jwtOptions = require('../../src/configs/jsonwebtoken');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const { createPublicTestBucket } = require('../../src/configs/s3TestSetup');

describe('User Management Integration Tests', () => {
    const mockUserPassword = 'password123';
    const originalBucketName = process.env.S3_BUCKET_NAME;
    let users, tokens;
    let userArrays = [],
        adminArrays = [];

    beforeAll(async () => {
        await createPublicTestBucket();
    });

    afterAll(async () => {
        server.close();
        await sequelize.close();
        await redisClient.close();
        process.env.S3_BUCKET_NAME = originalBucketName;
    });

    beforeEach(async () => {
        process.env.S3_BUCKET_NAME = process.env.S3_TEST_BUCKET_NAME;

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
                    message: 'Validation error.',
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

    describe('GET /api/v1/users/:userId', () => {
        it('should return 200 and fetches user data with admin token', async () => {
            const response = await request(server)
                .get('/api/v1/users/1')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved user data.',
                data: {
                    user: {
                        id: 1,
                        email: expect.any(String),
                        fullName: expect.any(String),
                        memberLevel: expect.any(String),
                        role: expect.any(String),
                        pictureUrl: expect.anything(),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    },
                },
                errors: null,
            });
        });

        it('should return 200 and fetches user data with user token', async () => {
            const response = await request(server)
                .get('/api/v1/users/1')
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved user data.',
                data: {
                    user: {
                        id: 1,
                        email: expect.any(String),
                        fullName: expect.any(String),
                        memberLevel: expect.any(String),
                        role: expect.any(String),
                        pictureUrl: expect.anything(),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    },
                },
                errors: null,
            });
        });

        it('should return 400 when path parameter is invalid', async () => {
            const response = await request(server)
                .get('/api/v1/users/abc')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
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
            });
        });

        it('should return 401 when no authorization provided', async () => {
            const response = await request(server).get('/api/v1/users/1');

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
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
            });
        });

        it('should return 403 when accessing other user resource', async () => {
            const response = await request(server)
                .get('/api/v1/users/4')
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(403);
            expect(response.body).toMatchObject({
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
            });
        });

        it('should return 404 when user does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/users/404')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                success: false,
                statusCode: 404,
                data: null,
                message: 'Resource not found.',
                errors: [
                    {
                        message: 'User with "userId" does not exist',
                        context: {
                            key: 'userId',
                            value: 404,
                        },
                    },
                ],
            });
        });
    });

    describe('PATCH /api/v1/users/:userId', () => {
        it('should return 200 and updates user data with fullName, email, and password', async () => {
            const mockPatchData = {
                fullName: 'John Doe Edited',
                email: 'johndoe@mail.com',
                password: 'okokokokokoko',
            };

            const response = await request(server)
                .patch('/api/v1/users/1')
                .send(mockPatchData)
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                statusCode: 200,
                message: 'Successfully updated user data.',
                data: {
                    user: {
                        id: 1,
                        email: expect.any(String),
                        fullName: expect.any(String),
                        memberLevel: expect.any(String),
                        role: expect.any(String),
                        pictureUrl: expect.anything(),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    },
                },
                errors: null,
            });
        });

        it('should return 200 and updates user data with fullName and email', async () => {
            const mockPatchData = {
                fullName: 'John Doe Edited',
                email: 'johndoe@mail.com',
            };

            const response = await request(server)
                .patch('/api/v1/users/1')
                .send(mockPatchData)
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                statusCode: 200,
                message: 'Successfully updated user data.',
                data: {
                    user: {
                        id: 1,
                        email: expect.any(String),
                        fullName: expect.any(String),
                        memberLevel: expect.any(String),
                        role: expect.any(String),
                        pictureUrl: expect.anything(),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    },
                },
                errors: null,
            });
        });

        it('should return 400 when request body is invalid', async () => {
            const mockPatchData = {
                fullName: 123,
                email: 123,
                password: 123,
            };

            const response = await request(server)
                .patch('/api/v1/users/1')
                .send(mockPatchData)
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                success: false,
                statusCode: 400,
                data: null,
                message: 'Validation error.',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.any(String),
                        context: expect.objectContaining({
                            key: expect.any(String),
                            value: expect.anything(),
                        }),
                    }),
                ]),
            });
        });

        it('should return 401 when no authorization provided', async () => {
            const mockPatchData = {
                fullName: 123,
                email: 123,
                password: 123,
            };

            const response = await request(server)
                .patch('/api/v1/users/1')
                .send(mockPatchData);

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
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
            });
        });

        it('should return 403 when accessing other user resource', async () => {
            const mockPatchData = {
                fullName: 123,
                email: 123,
                password: 123,
            };

            const response = await request(server)
                .patch('/api/v1/users/2')
                .send(mockPatchData)
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(403);
            expect(response.body).toMatchObject({
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
            });
        });

        it('should return 404 when resource not found', async () => {
            const mockPatchData = {
                fullName: 'John Doe Edited',
                email: 'johndoe@mail.com',
                password: 'okokokokokoko',
            };

            const response = await request(server)
                .patch('/api/v1/users/404')
                .send(mockPatchData)
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                success: false,
                statusCode: 404,
                data: null,
                message: 'Resource not found.',
                errors: [
                    {
                        message: 'User with "userId" does not exist',
                        context: {
                            key: 'userId',
                            value: 404,
                        },
                    },
                ],
            });
        });

        it('should return 415 when Content-Type header is not application/json', async () => {
            const response = await request(server)
                .patch('/api/v1/users/1')
                .set('Content-Type', 'multipart/form-data')
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(415);
            expect(response.body).toMatchObject({
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
            });
        });
    });

    describe('DELETE /api/v1/users/:userId', () => {
        it('should return 200 and deletes user data as the resource owner', async () => {
            const response = await request(server)
                .delete('/api/v1/users/1')
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted a user account.',
                data: null,
                errors: null,
            });
        });

        it('should return 200 and deletes user data as the admin', async () => {
            const response = await request(server)
                .delete('/api/v1/users/1')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted a user account.',
                data: null,
                errors: null,
            });
        });

        it('should return 400 when path parameter is invalid', async () => {
            const response = await request(server)
                .delete('/api/v1/users/abc')
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
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
            });
        });

        it('should return 401 when no authorization provided', async () => {
            const response = await request(server).delete('/api/v1/users/1');

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
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
            });
        });

        it('should return 403 when accessing other user resources', async () => {
            const response = await request(server)
                .delete('/api/v1/users/2')
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(403);
            expect(response.body).toMatchObject({
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
            });
        });

        it('should return 404 when user does not exist', async () => {
            const response = await request(server)
                .delete('/api/v1/users/404')
                .set('Authorization', `Bearer ${tokens.validAdmin}`);

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                success: false,
                statusCode: 404,
                data: null,
                message: 'Resource not found.',
                errors: [
                    {
                        message: 'User with "userId" does not exist',
                        context: {
                            key: 'userId',
                            value: 404,
                        },
                    },
                ],
            });
        });
    });

    describe('PUT /api/v1/users/:userId/profilePhotos', () => {
        const testImagePath = path.join(
            __dirname,
            'fixtures',
            'test-image.png',
        );

        it('should return 201 and successfully upload a profile photo as the resource owner', async () => {
            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validUser}`)
                .attach('photo', testImagePath);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                success: true,
                statusCode: 201,
                message: 'Successfully uploaded a profile picture.',
                data: {
                    pictureUrl: expect.stringContaining('.webp'),
                },
                errors: null,
            });
        }, 10000);

        it('should return 201 and successfully upload a profile photo as an admin', async () => {
            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validAdmin}`)
                .attach('photo', testImagePath);

            expect(response.status).toBe(201);
            expect(response.body.data.pictureUrl).toBeDefined();
        }, 10000);

        it('should return 400 when there is extra field', async () => {
            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validAdmin}`)
                .attach('photo', testImagePath)
                .attach('photo2', testImagePath);

            expect(response.status).toBe(400);
        });

        it('should return 400 when file is empty', async () => {
            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validAdmin}`)
                .attach('photo');

            expect(response.status).toBe(400);
        });

        it('should return 400 when path parameter is invalid', async () => {
            const response = await request(server)
                .put('/api/v1/users/abc/profilePhotos')
                .set('Authorization', `Bearer ${tokens.validUser}`)
                .send();

            expect(response.status).toBe(400);
        });

        it('should return 401 when no authorization is provided', async () => {
            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .attach('photo', testImagePath);

            expect(response.status).toBe(401);
        });

        it('should return 403 when a user tries to upload for another user', async () => {
            const response = await request(server)
                .put(`/api/v1/users/${users.admin[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validUser}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 when the user does not exist', async () => {
            const response = await request(server)
                .put('/api/v1/users/9999/profilePhotos')
                .set('Authorization', `Bearer ${tokens.validAdmin}`)
                .attach('photo', testImagePath);

            expect(response.status).toBe(404);
        });

        it('should return 413 when the file is too large', async () => {
            const largeImagePath = path.join(
                __dirname,
                'fixtures',
                'large-test-image.jpg',
            );
            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validUser}`)
                .attach('photo', largeImagePath);

            expect(response.status).toBe(413);
        });

        it('should return 415 for an unsupported file type', async () => {
            const textFilePath = path.join(
                __dirname,
                'fixtures',
                'test-file.txt',
            );

            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validUser}`)
                .attach('photo', textFilePath);

            expect(response.status).toBe(415);
        });

        it('should return 415 when the file type cannot be determined', async () => {
            const emptyFilePath = path.join(
                __dirname,
                'fixtures',
                'empty-file',
            );

            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validUser}`)
                .attach('photo', emptyFilePath);

            expect(response.status).toBe(415);
        });

        it('should return 415 for a fake image file', async () => {
            const fakeImagePath = path.join(
                __dirname,
                'fixtures',
                'fake-image.png',
            );

            const response = await request(server)
                .put(`/api/v1/users/${users.user[0].id}/profilePhotos`)
                .set('Authorization', `Bearer ${tokens.validUser}`)
                .attach('photo', fakeImagePath);

            expect(response.status).toBe(415);
        });
    });
});
