/* eslint-disable no-undef */
const request = require('supertest');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const programFactory = require('../../src/db/seeders/factories/program');
const enrollmentFactory = require('../../src/db/seeders/factories/enrollment');
const AuthService = require('../../src/services/auth.service');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');

describe('Enrollment Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens, programs;

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

        const courseProgram = await programFactory({ type: 'Course' });
        const workshopProgram = await programFactory({ type: 'Workshop' });
        const seminarProgram = await programFactory({ type: 'Seminar' });

        programs = {
            course: courseProgram,
            workshop: workshopProgram,
            seminar: seminarProgram,
        };

        await enrollmentFactory({
            userId: users.regular.id,
            programId: programs.course.id,
            status: 'In Progress',
            progressPercentage: 50.0,
        });
        await enrollmentFactory({
            userId: users.regular.id,
            programId: programs.workshop.id,
            status: 'Completed',
            progressPercentage: 100.0,
        });
        await enrollmentFactory({
            userId: users.another.id,
            programId: programs.seminar.id,
            status: 'Unpaid',
        });

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
        jest.clearAllMocks();
    });

    describe('GET /api/v1/enrollments', () => {
        it('should return 200 and fetches all enrollment data', async () => {
            const response = await request(server)
                .get('/api/v1/enrollments?limit=1&page=2')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.pagination.totalRecords).toBe(3);
        });

        it('should return 200 and fetches enrollment data for a specific user', async () => {
            const response = await request(server)
                .get(`/api/v1/enrollments?userId=${users.regular.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.enrollments.length).toBe(2);
        });

        it('should return 200 and filter enrollments by programType and status', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/enrollments?userId=${users.regular.id}&programType=course&status=in progress`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.enrollments.length).toBe(1);
            expect(response.body.data.enrollments[0].programType).toBe(
                'Course',
            );
        });

        it('should return 200 and sort enrollments by progress in descending order', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/enrollments?userId=${users.regular.id}&sort=-progress`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(
                parseFloat(
                    response.body.data.enrollments[0].progressPercentage,
                ),
            ).toBe(100.0);
        });

        it('should return 200 and filter by programId', async () => {
            const response = await request(server)
                .get(`/api/v1/enrollments?programId=${programs.course.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
        });

        it('should return 200 and fetches empty enrollments with a page number out of bounds', async () => {
            const response = await request(server)
                .get(`/api/v1/enrollments?userId=${users.regular.id}&page=100`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.enrollments.length).toBe(0);
        });

        it('should return 400 when invalid query param is used', async () => {
            const response = await request(server)
                .get('/api/v1/enrollments?sort=invalidSort')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
        });

        it('should return 401 when no access token is provided', async () => {
            const response = await request(server).get('/api/v1/enrollments');

            expect(response.status).toBe(401);
        });

        it('should return 403 when a regular user tries to access enrollments without providing a userId', async () => {
            const response = await request(server)
                .get('/api/v1/enrollments')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(403);
        });
    });
});
