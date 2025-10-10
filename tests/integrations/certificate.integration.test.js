/* eslint-disable no-undef */
const request = require('supertest');
const { server } = require('../../src/server');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const SchedulerService = require('../../src/services/scheduler.service');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const programFactory = require('../../src/db/seeders/factories/program');
const enrollmentFactory = require('../../src/db/seeders/factories/enrollment');
const certificateFactory = require('../../src/db/seeders/factories/certificate');
const AuthService = require('../../src/services/auth.service');

describe('Certificate Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens, certificates;

    afterAll(async () => {
        SchedulerService.stop();
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

        const program1 = await programFactory({ type: 'Course' });
        const program2 = await programFactory({ type: 'Workshop' });

        const enrollment1 = await enrollmentFactory({
            userId: users.regular.id,
            programId: program1.id,
            status: 'Completed',
        });
        const enrollment2 = await enrollmentFactory({
            userId: users.another.id,
            programId: program2.id,
            status: 'Completed',
        });

        const cert1 = await certificateFactory({
            enrollmentId: enrollment1.id,
            userId: users.regular.id,
        });
        const cert2 = await certificateFactory({
            enrollmentId: enrollment2.id,
            userId: users.another.id,
        });

        certificates = [cert1, cert2];
    });

    afterEach(async () => {
        await truncate();
    });

    describe('GET /api/v1/certificates', () => {
        it('should return 200 and all certificates for admin', async () => {
            const response = await request(server)
                .get('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.certificates.length).toBe(2);
        });

        it('should return 200 and all certificates for admin with last page', async () => {
            const response = await request(server)
                .get('/api/v1/certificates?limit=1&page=2')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.certificates.length).toBe(1);
        });

        it('should return 200 and all certificates for admin with first page has next page', async () => {
            const response = await request(server)
                .get('/api/v1/certificates?limit=1&page=1')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.certificates.length).toBe(1);
        });

        it('should return 200 and user-specific certificates', async () => {
            const response = await request(server)
                .get(`/api/v1/certificates?userId=${users.regular.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.certificates.length).toBe(1);
            expect(response.body.data.certificates[0].userId).toBe(
                users.regular.id,
            );
        });

        it('should return 200 and apply filters correctly', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/certificates?userId=${users.regular.id}&type=course`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.certificates.length).toBe(1);
            expect(response.body.data.certificates[0].programType).toBe(
                'Course',
            );
        });

        it('should return 200 and handle pagination correctly', async () => {
            const response = await request(server)
                .get(
                    '/api/v1/certificates?credential=CRS0001-U0001&programId=1&sort=-expiredAt',
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
        });

        it('should return 200 with no records when page is out of bounds', async () => {
            const response = await request(server)
                .get('/api/v1/certificates?limit=1&page=100')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.certificates.length).toBe(0);
        });

        it('should return 400 for invalid query parameters', async () => {
            const response = await request(server)
                .get('/api/v1/certificates?sort=invalidSort')
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(400);
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(server).get('/api/v1/certificates');
            expect(response.status).toBe(401);
        });

        it('should return 403 when a regular user tries to access without userId', async () => {
            const response = await request(server)
                .get('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(403);
        });

        it("should return 403 when a regular user tries to access another user's certificate data", async () => {
            const response = await request(server)
                .get(`/api/v1/certificates?userId=${users.another.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(403);
        });
    });
});
