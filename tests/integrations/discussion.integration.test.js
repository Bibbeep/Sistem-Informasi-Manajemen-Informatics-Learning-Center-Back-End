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
const { User, Comment, Like } = require('../../src/db/models');

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
        const deletedUser = await userFactory(
            { role: 'User' },
            mockUserPassword,
        );

        users = {
            admin: adminUser,
            regular: regularUser,
            another: anotherUser,
            deleted: deletedUser,
        };

        discussions = [];
        for (let i = 0; i < 3; i++) {
            const discussion = await discussionFactory({
                userId: users.admin.id,
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
        const comment1_4 = await commentFactory({
            discussionId: discussion1.id,
            userId: users.deleted.id,
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
        const reply1_2_3 = await commentFactory({
            discussionId: discussion1.id,
            userId: users.deleted.id,
            parentCommentId: comment1_2.id,
            message: 'Reply 2 to C2 D1',
        });

        await User.destroy({
            where: {
                id: users.deleted.id,
            },
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
            comment1_4,
            reply1_2_3,
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

        it('should return 200 and fetches discussions filtered by search query', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/discussions?q=${discussions[0].title.split(' ')[1]}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussions.length).toBe(1);
            expect(response.body.data.discussions[0].title).toBe(
                discussions[0].title,
            );
        });

        it('should return 200 and fetch all discussions for an admin user with limit 1 and page 2', async () => {
            const response = await request(server)
                .get('/api/v1/discussions?limit=1&page=2')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.discussions).toHaveLength(1);
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
                mainContent: 'Quick brown fox jumps over the white bear.',
            };
            const response = await request(server)
                .post('/api/v1/discussions')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(newDiscussion);

            expect(response.status).toBe(201);
            expect(response.body.data.discussion.title).toBe(
                newDiscussion.title,
            );
            expect(response.body.data.discussion.mainContent).toBe(
                newDiscussion.mainContent,
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
                mainContent: 'Updated Main Content',
            };
            const response = await request(server)
                .patch(`/api/v1/discussions/${discussionId}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data.discussion.title).toBe(updateData.title);
            expect(response.body.data.discussion.mainContent).toBe(
                updateData.mainContent,
            );
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
            expect(response.body.data.comments).toHaveLength(8);
            expect(response.body.pagination.totalRecords).toBe(8);
            expect(response.body.data.comments[0].parentCommentId).toBeNull();
            expect(response.body.data.comments[0].likesCount).toBe(2);
            expect(response.body.data.comments[0].repliesCount).toBe(1);
            expect(response.body.data.comments[1].likesCount).toBe(1);
            expect(response.body.data.comments[1].repliesCount).toBe(3);
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
            expect(response.body.data.comments).toHaveLength(4);
            expect(response.body.pagination.totalRecords).toBe(4);
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
                totalRecords: 8,
                currentPage: 1,
                totalPages: 4,
                nextPage: 2,
                prevPage: null,
            });
        });

        it('should return 200 and apply pagination correctly for page in the middle', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?limit=1&page=2`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(1);
            expect(response.body.pagination).toEqual({
                currentRecords: 1,
                totalRecords: 8,
                currentPage: 2,
                totalPages: 8,
                nextPage: 3,
                prevPage: 1,
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
            expect(response.body.data.comments).toHaveLength(8);
            expect(response.body.data.comments[0].id).toBe(comments[0].id);
        });

        it('should return 200 and sort by repliesCount descending', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?sort=-repliesCount`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(8);
            expect(response.body.data.comments[0].id).toBe(comments[1].id);
            expect(response.body.data.comments[1].id).toBe(comments[0].id);
        });

        it('should return 200 and sort by createdAt ascending', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments?sort=createdAt`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comments).toHaveLength(8);
            expect(response.body.data.comments[0].id).toBe(comments[0].id);
            expect(response.body.data.comments[1].id).toBe(comments[1].id);
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

        it('should return 200 and an empty list if page out of bounds', async () => {
            const discussionId = discussions[2].id;
            const response = await request(server)
                .get(`/api/v1/discussions/${discussionId}/comments?page=100`)
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

    describe('GET /api/v1/discussions/:discussionId/comments/:commentId', () => {
        it('should return 200 and fetch specific comment details without replies', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[1].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comment.id).toBe(commentId);
            expect(response.body.data.comment.message).toBe('Comment 2 D1');
            expect(response.body.data.comment.likesCount).toBe(1);
            expect(response.body.data.comment.repliesCount).toBe(3);
            expect(response.body.data.comment.replies).toBeUndefined();
            expect(response.body.message).toBe(
                'Successfully retrieved a comment details.',
            );
        });

        it('should return 200 and fetch specific comment details including replies', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[1].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}?includeReplies=true`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comment.id).toBe(commentId);
            expect(response.body.data.comment.replies).toHaveLength(3);
            expect(response.body.data.comment.replies[0].id).toBe(
                comments[4].id,
            );
            expect(response.body.data.comment.replies[1].id).toBe(
                comments[5].id,
            );
        });

        it('should return 200 and fetch specific comment details with deleted user', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[7].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.comment.id).toBe(commentId);
        });

        it('should return 400 for invalid discussionId format', async () => {
            const commentId = comments[0].id;
            const response = await request(server)
                .get(`/api/v1/discussions/abc/comments/${commentId}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 400 for invalid commentId format', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .get(`/api/v1/discussions/${discussionId}/comments/xyz`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 400 for invalid includeReplies query parameter', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;
            const response = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}?includeReplies=maybe`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
            expect(response.body.errors[0].message).toContain(
                '"includeReplies" must be a boolean',
            );
        });

        it('should return 401 for unauthenticated requests', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;
            const response = await request(server).get(
                `/api/v1/discussions/${discussionId}/comments/${commentId}`,
            );

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });

        it('should return 404 when the discussion does not exist', async () => {
            const commentId = comments[0].id;
            const response = await request(server)
                .get(`/api/v1/discussions/99999/comments/${commentId}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Discussion with "discussionId" does not exist',
            );
        });

        it('should return 404 when the comment does not exist within the specified discussion', async () => {
            const discussionId = discussions[0].id;
            const nonExistentCommentId = 99999;
            const responseNotFound = await request(server)
                .get(
                    `/api/v1/discussions/${discussionId}/comments/${nonExistentCommentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(responseNotFound.status).toBe(404);
            expect(responseNotFound.body.message).toBe('Resource not found.');
            expect(responseNotFound.body.errors[0].message).toContain(
                'Comment with "commentId" does not exist',
            );
        });
    });

    describe('POST /api/v1/discussions/:discussionId/comments', () => {
        it('should return 201 and create a top-level comment', async () => {
            const discussionId = discussions[0].id;
            const newComment = {
                message: 'This is a new top-level comment.',
                parentCommentId: null,
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(newComment);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(
                'Successfully created a comment.',
            );
            expect(response.body.data.comment).toBeDefined();
            expect(response.body.data.comment.discussionId).toBe(discussionId);
            expect(response.body.data.comment.userId).toBe(users.regular.id);
            expect(response.body.data.comment.message).toBe(newComment.message);
            expect(response.body.data.comment.parentCommentId).toBeNull();

            const createdComment = await Comment.findByPk(
                response.body.data.comment.id,
            );
            expect(createdComment).not.toBeNull();
            expect(createdComment.message).toBe(newComment.message);
        });

        it('should return 201 and create a reply comment', async () => {
            const discussionId = discussions[0].id;
            const parentCommentId = comments[0].id;
            const newReply = {
                message: 'This is a reply to the first comment.',
                parentCommentId: parentCommentId,
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.another}`)
                .send(newReply);

            expect(response.status).toBe(201);
            expect(response.body.data.comment.parentCommentId).toBe(
                parentCommentId,
            );
            expect(response.body.data.comment.userId).toBe(users.another.id);
            expect(response.body.data.comment.message).toBe(newReply.message);

            const createdReply = await Comment.findByPk(
                response.body.data.comment.id,
            );
            expect(createdReply).not.toBeNull();
            expect(createdReply.parentCommentId).toBe(parentCommentId);
        });

        it('should return 400 for invalid request body (missing message)', async () => {
            const discussionId = discussions[0].id;
            const invalidComment = {
                parentCommentId: null,
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(invalidComment);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
            expect(response.body.errors[0].message).toContain(
                '"message" is required',
            );
        });

        it('should return 400 for invalid parentCommentId format (not integer or null)', async () => {
            const discussionId = discussions[0].id;
            const invalidComment = {
                message: 'Test comment',
                parentCommentId: 'abc',
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(invalidComment);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
            expect(response.body.errors[0].message).toContain(
                '"parentCommentId" must be a number',
            );
        });

        it('should return 400 for invalid discussionId format in URL', async () => {
            const invalidDiscussionId = 'abc';
            const newComment = {
                message: 'Test message',
                parentCommentId: null,
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${invalidDiscussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(newComment);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 for unauthenticated requests', async () => {
            const discussionId = discussions[0].id;
            const newComment = {
                message: 'Unauthorized comment',
                parentCommentId: null,
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments`)
                .send(newComment);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });

        it('should return 404 when discussion does not exist', async () => {
            const nonExistentDiscussionId = 99999;
            const newComment = {
                message: 'Comment for non-existent discussion',
                parentCommentId: null,
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${nonExistentDiscussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(newComment);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Discussion with "discussionId" does not exist',
            );
        });

        it('should return 404 when parentCommentId refers to a non-existent comment', async () => {
            const discussionId = discussions[0].id;
            const nonExistentParentId = 99999;
            const newReply = {
                message: 'Reply to non-existent comment',
                parentCommentId: nonExistentParentId,
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(newReply);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Comment with "parentCommentId" does not exist',
            );
        });

        it('should return 404 when parentCommentId belongs to a different discussion', async () => {
            const discussionId = discussions[0].id;
            const parentCommentId = comments[6].id;
            const newReply = {
                message: 'Reply attempt across discussions',
                parentCommentId: parentCommentId,
            };

            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(newReply);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Comment with "parentCommentId" does not exist',
            );
        });

        it('should return 415 for incorrect content type', async () => {
            const discussionId = discussions[0].id;

            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .set('Content-Type', 'text/plain')
                .send('message=Some message&parentCommentId=null');

            expect(response.status).toBe(415);
            expect(response.body.message).toBe('Unsupported Media Type.');
        });
    });

    describe('PATCH /api/v1/discussions/:discussionId/comments/:commentId', () => {
        it('should return 200 and update the comment message by the owner', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;
            const updateData = { message: 'Updated message by owner.' };

            const response = await request(server)
                .patch(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(
                'Successfully updated a comment.',
            );
            expect(response.body.data.comment.id).toBe(commentId);
            expect(response.body.data.comment.message).toBe(updateData.message);

            const updatedComment = await Comment.findByPk(commentId);
            expect(updatedComment.message).toBe(updateData.message);
        });

        it('should return 200 and update the comment message by an admin', async () => {
            const discussionId = discussions[0].id;
            const updateData = { message: 'Updated message by admin.' };
            const commentId = 1;

            const response = await request(server)
                .patch(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data.comment.message).toBe(updateData.message);

            const updatedComment = await Comment.findByPk(commentId);
            expect(updatedComment.message).toBe(updateData.message);
        });

        it('should return 400 for invalid request body (empty message)', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;

            const response = await request(server)
                .patch(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ message: '' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
            expect(response.body.errors[0].message).toContain(
                '"message" is not allowed to be empty',
            );
        });

        it('should return 400 for invalid discussionId format', async () => {
            const commentId = comments[0].id;
            const updateData = { message: 'Valid message' };

            const response = await request(server)
                .patch(`/api/v1/discussions/abc/comments/${commentId}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(updateData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 400 for invalid commentId format', async () => {
            const discussionId = discussions[0].id;
            const updateData = { message: 'Valid message' };

            const response = await request(server)
                .patch(`/api/v1/discussions/${discussionId}/comments/xyz`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(updateData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 for unauthenticated requests', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;
            const response = await request(server).patch(
                `/api/v1/discussions/${discussionId}/comments/${commentId}`,
            );

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });

        it("should return 403 when a user tries to update another user's comment", async () => {
            const discussionId = discussions[0].id;
            const updateData = { message: 'Forbidden update attempt' };
            const commentId = 2;

            const response = await request(server)
                .patch(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(updateData);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');
        });

        it('should return 404 when discussion does not exist', async () => {
            const nonExistentDiscussionId = 99999;
            const commentId = comments[0].id;
            const updateData = {
                message: 'Update for non-existent discussion',
            };

            const response = await request(server)
                .patch(
                    `/api/v1/discussions/${nonExistentDiscussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Discussion with "discussionId" does not exist',
            );
        });

        it('should return 404 when comment does not exist', async () => {
            const discussionId = discussions[0].id;
            const nonExistentCommentId = 99999;
            const updateData = { message: 'Update for non-existent comment' };

            const response = await request(server)
                .patch(
                    `/api/v1/discussions/${discussionId}/comments/${nonExistentCommentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Comment with "commentId" does not exist',
            );
        });

        it('should return 404 when comment exists but belongs to a different discussion', async () => {
            const updateData = { message: 'Cross-discussion update attempt' };
            const commentId = 808;
            const discussionId = 1;

            const response = await request(server)
                .patch(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Comment with "commentId" does not exist',
            );
        });

        it('should return 415 for incorrect content type', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;

            const response = await request(server)
                .patch(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .set('Content-Type', 'text/plain')
                .send('message=Some new message');

            expect(response.status).toBe(415);
            expect(response.body.message).toBe('Unsupported Media Type.');
        });
    });

    describe('DELETE /api/v1/discussions/:discussionId/comments/:commentId', () => {
        it('should return 200 and soft delete the comment by the owner', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(
                'Successfully deleted a discussion forum.',
            );
            expect(response.body.data).toBeNull();

            const deletedComment = await Comment.findByPk(commentId, {
                paranoid: false,
            });
            expect(deletedComment).not.toBeNull();
            expect(deletedComment.deletedAt).not.toBeNull();

            const commentAfterDelete = await Comment.findByPk(commentId);
            expect(commentAfterDelete).toBeNull();
        });

        it('should return 200 and soft delete the comment by an admin', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);

            const deletedComment = await Comment.findByPk(commentId, {
                paranoid: false,
            });
            expect(deletedComment).not.toBeNull();
            expect(deletedComment.deletedAt).not.toBeNull();
        });

        it('should return 400 for invalid discussionId format', async () => {
            const commentId = comments[0].id;
            const response = await request(server)
                .delete(`/api/v1/discussions/abc/comments/${commentId}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 400 for invalid commentId format', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .delete(`/api/v1/discussions/${discussionId}/comments/xyz`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 for unauthenticated requests', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;

            const response = await request(server).delete(
                `/api/v1/discussions/${discussionId}/comments/${commentId}`,
            );

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });

        it("should return 403 when a user tries to delete another user's comment", async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.another}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');

            const commentAfterAttempt = await Comment.findByPk(commentId);
            expect(commentAfterAttempt).not.toBeNull();
        });

        it('should return 404 when discussion does not exist', async () => {
            const nonExistentDiscussionId = 99999;
            const commentId = comments[0].id;

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${nonExistentDiscussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Discussion with "discussionId" does not exist',
            );
        });

        it('should return 404 when comment does not exist', async () => {
            const discussionId = discussions[0].id;
            const nonExistentCommentId = 99999;

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${nonExistentCommentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Comment with "commentId" does not exist',
            );
        });

        it('should return 404 when comment exists but belongs to a different discussion', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[6].id;

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Comment with "commentId" does not exist',
            );

            const commentAfterAttempt = await Comment.findByPk(commentId);
            expect(commentAfterAttempt).not.toBeNull();
        });

        it('should return 404 when trying to delete an already deleted comment', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;

            await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Comment with "commentId" does not exist',
            );
        });
    });

    describe('POST /api/v1/discussions/:discussionId/comments/:commentId/likes', () => {
        it('should return 201 and increment likes count when liking a comment', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[2].id;
            const initialComment = await Comment.findByPk(commentId, {
                attributes: [
                    [
                        sequelize.fn('COUNT', sequelize.col('likes.id')),
                        'likesCount',
                    ],
                ],
                include: [{ model: Like, as: 'likes', attributes: [] }],
                group: ['Comment.id'],
                raw: true,
            });
            expect(
                initialComment ? parseInt(initialComment.likesCount, 10) : 0,
            ).toBe(0);

            const response = await request(server)
                .post(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}/likes`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Successfully liked a comment.');
            expect(response.body.data.likesCount).toBe(1);
            const like = await Like.findOne({
                where: { commentId: commentId, userId: users.regular.id },
            });
            expect(like).not.toBeNull();

            const updatedComment = await Comment.findByPk(commentId, {
                attributes: [
                    [
                        sequelize.fn('COUNT', sequelize.col('likes.id')),
                        'likesCount',
                    ],
                ],
                include: [{ model: Like, as: 'likes', attributes: [] }],
                group: ['Comment.id'],
                raw: true,
            });
            expect(parseInt(updatedComment.likesCount, 10)).toBe(1);
        });

        it('should return 409 when trying to like a comment already liked by the user', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;

            const response = await request(server)
                .post(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}/likes`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Resource conflict.');
            expect(response.body.errors[0].message).toContain(
                'already been liked',
            );
        });

        it('should return 400 for invalid discussionId format', async () => {
            const commentId = comments[0].id;
            const response = await request(server)
                .post(`/api/v1/discussions/abc/comments/${commentId}/likes`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid commentId format', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .post(`/api/v1/discussions/${discussionId}/comments/xyz/likes`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
        });

        it('should return 401 for unauthenticated requests', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;
            const response = await request(server).post(
                `/api/v1/discussions/${discussionId}/comments/${commentId}/likes`,
            );

            expect(response.status).toBe(401);
        });

        it('should return 404 when discussion does not exist', async () => {
            const commentId = comments[0].id;
            const response = await request(server)
                .post(`/api/v1/discussions/99999/comments/${commentId}/likes`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(404);
            expect(response.body.errors[0].message).toContain('Discussion');
        });

        it('should return 404 when comment does not exist', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .post(
                    `/api/v1/discussions/${discussionId}/comments/99999/likes`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(404);
            expect(response.body.errors[0].message).toContain('Comment');
        });

        it('should return 404 when comment exists but in a different discussion', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[6].id;

            const response = await request(server)
                .post(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}/likes`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(404);
            expect(response.body.errors[0].message).toContain('Comment');
        });
    });

    describe('DELETE /api/v1/discussions/:discussionId/comments/:commentId/likes', () => {
        it('should return 200 and decrement likes count when unliking a comment', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;
            const userId = users.admin.id;

            const like = await Like.findOne({ where: { commentId, userId } });
            expect(like).not.toBeNull();

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}/likes`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(
                'Successfully unliked a comment.',
            );
            expect(response.body.data.likesCount).toBe(1);

            const likeAfter = await Like.findOne({
                where: { commentId, userId },
            });
            expect(likeAfter).toBeNull();
        });

        it('should return 404 when trying to unlike a comment the user has not liked', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[2].id;

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}/likes`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain(
                'Like on comment',
            );
        });

        it('should return 400 for invalid discussionId format', async () => {
            const commentId = comments[0].id;
            const response = await request(server)
                .delete(`/api/v1/discussions/abc/comments/${commentId}/likes`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid commentId format', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/xyz/likes`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
        });

        it('should return 401 for unauthenticated requests', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[0].id;
            const response = await request(server).delete(
                `/api/v1/discussions/${discussionId}/comments/${commentId}/likes`,
            );

            expect(response.status).toBe(401);
        });

        it('should return 404 when discussion does not exist', async () => {
            const commentId = comments[0].id;
            const response = await request(server)
                .delete(`/api/v1/discussions/99999/comments/${commentId}/likes`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(404);
            expect(response.body.errors[0].message).toContain('Discussion');
        });

        it('should return 404 when comment does not exist', async () => {
            const discussionId = discussions[0].id;
            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/99999/likes`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(404);
            expect(response.body.errors[0].message).toContain('Comment');
        });

        it('should return 404 when comment exists but in a different discussion', async () => {
            const discussionId = discussions[0].id;
            const commentId = comments[6].id;

            const response = await request(server)
                .delete(
                    `/api/v1/discussions/${discussionId}/comments/${commentId}/likes`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.errors[0].message).toContain('Comment');
        });
    });
});
