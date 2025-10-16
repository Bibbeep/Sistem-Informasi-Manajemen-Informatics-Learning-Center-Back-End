/* eslint-disable no-undef */
const request = require('supertest');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const discussionFactory = require('../../src/db/seeders/factories/discussion');
const AuthService = require('../../src/services/auth.service');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');

describe('Discussion Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens, discussions;

    afterAll(async () => {
        server.close();
        await sequelize.close();
        await redisClient.close();
    });

    beforeEach(async () => {
        const adminUser = await userFactory(
            { role: 'Admin' },
            mockUserPassword,
        );
        const regularUser = await userFactory(
            { role: 'User' },
            mockUserPassword,
        );

        users = {
            admin: adminUser,
            regular: regularUser,
        };

        discussions = [];
        for (let i = 0; i < 25; i++) {
            const discussion = await discussionFactory({
                adminUserId: users.admin.id,
                title: `Discussion about ${i % 2 === 0 ? 'Technology' : 'Development'}`,
            });
            discussions.push(discussion);
        }

        tokens = {
            admin: (
                await AuthService.login({
                    email: users.admin.email,
                    password: mockUserPassword,
                })
            ).accessToken,
            regular: (
                await AuthService.login({
                    email: users.regular.email,
                    password: mockUserPassword,
                })
            ).accessToken,
        };
    });

    afterEach(async () => {
        await truncate();
    });

    describe('GET /api/v1/discussions', () => {
        it('should return 200 and fetch all discussions for an admin user', async () => {
            const response = await request(server)
                .get('/api/v1/discussions')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussions).toHaveLength(10);
            expect(response.body.pagination.totalRecords).toBe(25);
            expect(response.body.message).toBe(
                'Successfully retrieved all discussion forums.',
            );
        });

        it('should return 200 and fetch all discussions for a regular user', async () => {
            const response = await request(server)
                .get('/api/v1/discussions')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussions).toHaveLength(10);
            expect(response.body.pagination.totalRecords).toBe(25);
        });

        it('should return 200 and apply query parameters correctly (pagination, sort, filter)', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/discussions?page=2&limit=5&sort=-createdAt&title=Discussion about Technology',
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussions.length).toBe(5);
            expect(response.body.pagination.currentPage).toBe(2);
            expect(response.body.pagination.totalRecords).toBe(13);
        });

        it('should return 200 and handle an out-of-bounds page number gracefully', async () => {
            const response = await request(server)
                .get('/api/v1/discussions?page=100')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussions).toHaveLength(0);
            expect(response.body.pagination.currentRecords).toBe(0);
        });

        it('should return 400 for invalid query parameters', async () => {
            const response = await request(server)
                .get('/api/v1/discussions?sort=invalidField&page=abc')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
            expect(response.body.errors).toBeInstanceOf(Array);
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(server).get('/api/v1/discussions');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });
    });

    describe('GET /api/v1/discussions/:discussionId', () => {
        it('should return 200 and fetch discussion details for an admin user', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.discussion.id).toBe(discussionId);
            expect(response.body.message).toBe(
                'Successfully retrieved discussion forum details.',
            );
        });

        it('should return 200 and fetch discussion details for a regular user', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussion.id).toBe(discussionId);
        });

        it('should return 400 for an invalid discussionId', async () => {
            const response = await request(server)
                .get('/api/v1/discussions/abc')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 for an unauthenticated request', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server).get(
                `/api/v1/discussions/${discussionId}`,
            );

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });

        it('should return 404 when the discussion does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/discussions/99999')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
        });
    });
});
