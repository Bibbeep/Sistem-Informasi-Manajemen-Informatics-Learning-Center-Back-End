/* eslint-disable no-undef */
const request = require('supertest');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const discussionFactory = require('../../src/db/seeders/factories/discussion');
const commentFactory = require('../../src/db/seeders/factories/comment');
const likeFactory = require('../../src/db/seeders/factories/likes');
const AuthService = require('../../src/services/auth.service');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');

describe('Discussion Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens, discussions, comments;

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
        const anotherUser = await userFactory(
            { role: 'User' },
            mockUserPassword,
        );

        users = {
            admin: adminUser,
            regular: regularUser,
            another: anotherUser,
        };

        discussions = [];
        for (let i = 0; i < 3; i++) {
            const discussion = await discussionFactory({
                adminUserId: users.admin.id,
                title: `Discussion ${i + 1}`,
            });
            discussions.push(discussion);
        }

        comments = [];
        const discussion1 = discussions[0];
        const discussion2 = discussions[1];

        const comment1_1 = await commentFactory({
            discussionId: discussion1.id,
            userId: users.regular.id,
            message: 'Comment 1 D1',
            createdAt: new Date('2025-10-18T08:00:00Z'),
        });
        const comment1_2 = await commentFactory({
            discussionId: discussion1.id,
            userId: users.another.id,
            message: 'Comment 2 D1',
            createdAt: new Date('2025-10-18T09:00:00Z'),
        });
        const comment1_3 = await commentFactory({
            discussionId: discussion1.id,
            userId: users.regular.id,
            message: 'Comment 3 D1',
            createdAt: new Date('2025-10-18T10:00:00Z'),
        });

        const reply1_1_1 = await commentFactory({
            discussionId: discussion1.id,
            userId: users.admin.id,
            parentCommentId: comment1_1.id,
            message: 'Reply 1 to C1 D1',
        });
        const reply1_2_1 = await commentFactory({
            discussionId: discussion1.id,
            userId: users.regular.id,
            parentCommentId: comment1_2.id,
            message: 'Reply 1 to C2 D1',
        });
        const reply1_2_2 = await commentFactory({
            discussionId: discussion1.id,
            userId: users.another.id,
            parentCommentId: comment1_2.id,
            message: 'Reply 2 to C2 D1',
        });

        const comment2_1 = await commentFactory({
            discussionId: discussion2.id,
            userId: users.regular.id,
            message: 'Comment 1 D2',
        });

        comments = [
            comment1_1,
            comment1_2,
            comment1_3,
            reply1_1_1,
            reply1_2_1,
            reply1_2_2,
            comment2_1,
        ];

        await likeFactory({ commentId: comment1_1.id, userId: users.admin.id });
        await likeFactory({
            commentId: comment1_1.id,
            userId: users.another.id,
        });
        await likeFactory({
            commentId: comment1_2.id,
            userId: users.regular.id,
        });
        await likeFactory({
            commentId: reply1_1_1.id,
            userId: users.regular.id,
        });
        await likeFactory({ commentId: comment2_1.id, userId: users.admin.id });

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
            another: (
                await AuthService.login({
                    email: users.another.email,
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
            expect(response.body.data.discussions).toHaveLength(3);
            expect(response.body.pagination.totalRecords).toBe(3);
            expect(response.body.message).toBe(
                'Successfully retrieved all discussion forums.',
            );
        });

        it('should return 200 and fetch all discussions for a regular user', async () => {
            const response = await request(server)
                .get('/api/v1/discussions')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussions).toHaveLength(3);
            expect(response.body.pagination.totalRecords).toBe(3);
        });

        it('should return 200 and apply query parameters correctly (pagination, sort, filter)', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/discussions?page=2&limit=5&sort=-createdAt&title=Discussion about Technology',
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussions.length).toBe(0);
            expect(response.body.pagination.currentPage).toBe(2);
            expect(response.body.pagination.totalRecords).toBe(0);
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

    describe('DELETE /api/v1/discussions/:discussionId', () => {
        it('should return 200 and delete the discussion for an admin user', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .delete(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(
                'Successfully deleted a discussion forum.',
            );
        });

        it('should return 400 for an invalid discussionId', async () => {
            const response = await request(server)
                .delete('/api/v1/discussions/abc')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
        });

        it('should return 401 for an unauthenticated request', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server).delete(
                `/api/v1/discussions/${discussionId}`,
            );

            expect(response.status).toBe(401);
        });

        it('should return 403 for a regular user trying to delete a discussion', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .delete(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');
        });

        it('should return 404 when trying to delete a non-existent discussion', async () => {
            const response = await request(server)
                .delete('/api/v1/discussions/99999')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
        });
    });

    describe('GET /api/v1/discussions/:discussionId/comments', () => {
        it('should return 200 and fetch top-level comments for a discussion with default params', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.comments).toHaveLength(6);
            expect(response.body.pagination.totalRecords).toBe(6);
            expect(response.body.data.comments[0].parentCommentId).toBeNull();
            expect(response.body.data.comments[0].likesCount).toBe(2);
            expect(response.body.data.comments[0].repliesCount).toBe(1);
            expect(response.body.data.comments[1].likesCount).toBe(1);
            expect(response.body.data.comments[1].repliesCount).toBe(2);
            expect(response.body.data.comments[2].likesCount).toBe(0);
            expect(response.body.data.comments[2].repliesCount).toBe(0);
            expect(response.body.message).toBe(
                'Successfully retrieved all comments.',
            );
        });

        it('should return 200 and fetch replies for a specific comment using parentCommentId', async () => {
            const discussionId = discussions[0].id;
            const parentCommentId = comments[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?parentCommentId=${parentCommentId}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(1);
            expect(response.body.pagination.totalRecords).toBe(1);
            expect(response.body.data.comments[0].parentCommentId).toBe(
                parentCommentId,
            );
            expect(response.body.data.comments[0].likesCount).toBe(1);
        });

        it('should return 200 and fetch top-level comments when parentCommentId=0', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?parentCommentId=0`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(3);
            expect(response.body.pagination.totalRecords).toBe(3);
            expect(response.body.data.comments[0].parentCommentId).toBeNull();
        });

        it('should return 200 and apply pagination correctly', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?limit=2&page=1`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(2);
            expect(response.body.pagination).toEqual({
                currentRecords: 2,
                totalRecords: 6,
                currentPage: 1,
                totalPages: 3,
                nextPage: 2,
                prevPage: null,
            });
        });

        it('should return 200 and sort by likesCount descending', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?sort=-likesCount`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(6);
            expect(response.body.data.comments[0].id).toBe(comments[0].id);
            expect(response.body.data.comments[1].id).toBe(comments[1].id);
        });

        it('should return 200 and sort by repliesCount descending', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?sort=-repliesCount`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(6);
            expect(response.body.data.comments[0].id).toBe(comments[1].id);
            expect(response.body.data.comments[1].id).toBe(comments[0].id);
            expect(response.body.data.comments[2].id).toBe(comments[2].id);
        });

        it('should return 200 and sort by createdAt ascending', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?sort=createdAt`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(6);
            expect(response.body.data.comments[0].id).toBe(comments[0].id);
            expect(response.body.data.comments[1].id).toBe(comments[1].id);
            expect(response.body.data.comments[2].id).toBe(comments[2].id);
        });

        it('should return 200 and an empty list if no comments exist for the discussion', async () => {
            const discussionId = discussions[2].id;
            const response = await request(server)
                .get(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(0);
            expect(response.body.pagination.totalRecords).toBe(0);
        });

        it('should return 400 for invalid discussionId format', async () => {
            const response = await request(server)
                .get('/api/v1/discussions/abc/comments')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 400 for invalid query parameters (e.g., negative page)', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(`/api/v1/discussions/${discussionId}/comments?page=-1`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 for unauthenticated requests', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server).get(
                `/api/v1/discussions/${discussionId}/comments`,
            );

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });

        it('should return 404 when the discussion does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/discussions/99999/comments')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Discussion with "discussionId" does not exist',
            );
        });
    });
});
