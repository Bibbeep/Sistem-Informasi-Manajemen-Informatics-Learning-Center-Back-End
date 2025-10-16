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

    describe('POST /api/v1/discussions', () => {
        it('should return 201 and create a new discussion for an admin user', async () => {
            const newDiscussion = {
                title: 'New Discussion by Admin',
            };
            const response = await request(server)
                .post('/api/v1/discussions')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(newDiscussion);

            expect(response.status).toBe(201);
            expect(response.body.data.discussion.title).toBe(
                newDiscussion.title,
            );
            expect(response.body.message).toBe(
                'Successfully created a discussion forum.',
            );
        });

        it('should return 400 for invalid request body', async () => {
            const response = await request(server)
                .post('/api/v1/discussions')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: '' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(server)
                .post('/api/v1/discussions')
                .send({ title: 'Unauthorized Discussion' });

            expect(response.status).toBe(401);
        });

        it('should return 403 for a regular user trying to create a discussion', async () => {
            const newDiscussion = {
                title: 'Forbidden Discussion',
            };
            const response = await request(server)
                .post('/api/v1/discussions')
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(newDiscussion);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');
        });

        it('should return 415 for incorrect content type', async () => {
            const response = await request(server)
                .post('/api/v1/discussions')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .set('Content-Type', 'text/plain')
                .send('title=some title');

            expect(response.status).toBe(415);
        });
    });

    describe('PATCH /api/v1/discussions/:discussionId', () => {
        it('should return 200 and update the discussion for an admin user', async () => {
            const discussionId = discussions[0].id;
            const updateData = {
                title: 'Updated Discussion Title',
            };
            const response = await request(server)
                .patch(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data.discussion.title).toBe(updateData.title);
            expect(response.body.message).toBe(
                'Successfully updated a discussion forum.',
            );
        });

        it('should return 400 for an invalid discussionId', async () => {
            const response = await request(server)
                .patch('/api/v1/discussions/abc')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: 'New Title' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid request body', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .patch(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: '' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 for an unauthenticated request', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .patch(`/api/v1/discussions/${discussionId}`)
                .send({ title: 'New Title' });

            expect(response.status).toBe(401);
        });

        it('should return 403 for a regular user trying to update a discussion', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .patch(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ title: 'Forbidden Update' });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');
        });

        it('should return 404 when trying to update a non-existent discussion', async () => {
            const response = await request(server)
                .patch('/api/v1/discussions/99999')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: 'New Title' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
        });

        it('should return 415 for incorrect content type', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .patch(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .set('Content-Type', 'text/plain')
                .send('title=some new title');

            expect(response.status).toBe(415);
        });
    });
});
