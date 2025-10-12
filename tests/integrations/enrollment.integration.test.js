/* eslint-disable no-undef */
jest.mock('../../src/utils/printPdf');
jest.mock('@aws-sdk/lib-storage');
const request = require('supertest');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const programFactory = require('../../src/db/seeders/factories/program');
const enrollmentFactory = require('../../src/db/seeders/factories/enrollment');
const AuthService = require('../../src/services/auth.service');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const {
    CourseModule,
    Course,
    CompletedModule,
    Enrollment,
} = require('../../src/db/models');
const courseFactory = require('../../src/db/seeders/factories/course');
const printPdf = require('../../src/utils/printPdf');
const { Upload } = require('@aws-sdk/lib-storage');

describe('Enrollment Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens, programs, enrollments, courseModules;

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
        const freeProgram = await programFactory({
            type: 'Course',
            priceIdr: 0,
        });

        await courseFactory({ programId: courseProgram.id });

        programs = {
            course: courseProgram,
            workshop: workshopProgram,
            seminar: seminarProgram,
            free: freeProgram,
        };

        const courseEnrollment = await enrollmentFactory({
            userId: users.regular.id,
            programId: programs.course.id,
            status: 'In Progress',
        });
        const workshopEnrollment = await enrollmentFactory({
            userId: users.regular.id,
            programId: programs.workshop.id,
            status: 'In Progress',
        });
        const seminarEnrollment = await enrollmentFactory({
            userId: users.another.id,
            programId: programs.seminar.id,
            status: 'In Progress',
        });
        const completedEnrollment = await enrollmentFactory({
            userId: users.regular.id,
            programId: programs.seminar.id,
            status: 'Completed',
            progressPercentage: 100.0,
        });
        const unpaidEnrollment = await enrollmentFactory({
            userId: users.regular.id,
            programId: programs.course.id,
            status: 'Unpaid',
        });

        const courseModel = await Course.findOne({
            where: { programId: courseProgram.id },
        });
        courseModules = await CourseModule.findAll({
            where: { courseId: courseModel.id },
        });

        await CompletedModule.create({
            enrollmentId: courseEnrollment.id,
            courseModuleId: courseModules[1].id,
            completedAt: new Date(),
        });

        enrollments = {
            course: courseEnrollment,
            workshop: workshopEnrollment,
            seminar: seminarEnrollment,
            completed: completedEnrollment,
            unpaid: unpaidEnrollment,
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

        printPdf.mockResolvedValue(Buffer.from('mock-pdf-content'));
        Upload.mockImplementation(() => {
            return {
                done: () => {
                    return Promise.resolve({
                        Location: 'https://fake-s3.com/new-cert.pdf',
                    });
                },
            };
        });
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
            expect(response.body.pagination.totalRecords).toBe(5);
        });

        it('should return 200 and fetches enrollment data for a specific user', async () => {
            const response = await request(server)
                .get(`/api/v1/enrollments?userId=${users.regular.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.enrollments.length).toBe(4);
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

    describe('GET /api/v1/enrollments/:enrollmentId', () => {
        it('should return 200 and fetches enrollment Course data', async () => {
            const response = await request(server)
                .get(`/api/v1/enrollments/${enrollments.course.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.enrollment.programType).toBe('Course');
            expect(
                response.body.data.enrollment.completedModules,
            ).toBeDefined();
        });

        it('should return 200 and fetches enrollment Seminar data', async () => {
            const response = await request(server)
                .get(`/api/v1/enrollments/${enrollments.seminar.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.enrollment.programType).toBe('Seminar');
            expect(
                response.body.data.enrollment.completedModules,
            ).toBeUndefined();
        });

        it('should return 400 when invalid path param', async () => {
            const response = await request(server)
                .get('/api/v1/enrollments/abc')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(400);
        });

        it('should return 401 when no access token is provided', async () => {
            const response = await request(server).get(
                `/api/v1/enrollments/${enrollments.course.id}`,
            );

            expect(response.status).toBe(401);
        });

        it('should return 403 when forbidden user access', async () => {
            const response = await request(server)
                .get(`/api/v1/enrollments/${enrollments.seminar.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 when enrollment does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/enrollments/9999')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/v1/enrollments', () => {
        it('should return 201 and creates a new enrollment of paid program', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments')
                .set('Authorization', `Bearer ${tokens.another}`)
                .send({ programId: programs.course.id });

            expect(response.status).toBe(201);
            expect(response.body.data.enrollment).toBeDefined();
            expect(response.body.data.invoice).toBeDefined();
            expect(response.body.data.enrollment.status).toBe('Unpaid');
            expect(response.body.data.invoice.status).toBe('Unverified');
        });

        it('should return 201 and creates a new enrollment of free program', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments')
                .set('Authorization', `Bearer ${tokens.another}`)
                .send({ programId: programs.free.id });

            expect(response.status).toBe(201);
            expect(response.body.data.enrollment).toBeDefined();
            expect(response.body.data.invoice).toBeDefined();
            expect(response.body.data.enrollment.status).toBe('In Progress');
            expect(response.body.data.invoice.status).toBe('Verified');
        });

        it('should return 400 when invalid request body', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments')
                .set('Authorization', `Bearer ${tokens.another}`)
                .send({ programId: 'abc' });

            expect(response.status).toBe(400);
        });

        it('should return 401 when invalid access token', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments')
                .send({ programId: programs.course.id });

            expect(response.status).toBe(401);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments')
                .set('Authorization', `Bearer ${tokens.another}`)
                .send({ programId: 9999 });

            expect(response.status).toBe(404);
        });

        it('should return 409 when enrollment already exist for a program', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments')
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ programId: programs.course.id });

            expect(response.status).toBe(409);
        });

        it('should return 415 when invalid Content-Type header', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments')
                .set('Authorization', `Bearer ${tokens.regular}`)
                .set('Content-Type', 'text/plain')
                .send('programId=1');

            expect(response.status).toBe(415);
        });
    });

    describe('PATCH /api/v1/enrollments/:enrollmentId', () => {
        it('should return 200 and update enrollment status to Completed', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.workshop.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(200);
            expect(response.body.data.enrollment.status).toBe('Completed');
            expect(response.body.data.enrollment.progressPercentage).toBe(
                '100.00',
            );
        });

        it('should return 200 and update enrollment as admin', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.seminar.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(200);
            expect(response.body.data.enrollment.status).toBe('Completed');
        });

        it('should return 400 for invalid enrollmentId', async () => {
            const response = await request(server)
                .patch('/api/v1/enrollments/abc')
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid request body', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.workshop.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ status: 'In Progress' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for an already completed enrollment', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.completed.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for an unpaid enrollment', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.unpaid.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for a course enrollment', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.course.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(400);
        });

        it('should return 401 when no token is provided', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.workshop.id}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(401);
        });

        it('should return 403 when user tries to update another user enrollment', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.seminar.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(403);
        });

        it('should return 404 when enrollment does not exist', async () => {
            const response = await request(server)
                .patch('/api/v1/enrollments/9999')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ status: 'Completed' });

            expect(response.status).toBe(404);
        });

        it('should return 415 when content type is not application/json', async () => {
            const response = await request(server)
                .patch(`/api/v1/enrollments/${enrollments.workshop.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .set('Content-Type', 'text/plain')
                .send('status=Completed');

            expect(response.status).toBe(415);
        });
    });

    describe('DELETE /api/v1/enrollments/:enrollmentId', () => {
        it('should return 200 and delete an enrollment as an admin', async () => {
            const response = await request(server)
                .delete(`/api/v1/enrollments/${enrollments.course.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(
                'Successfully deleted an enrollment.',
            );
        });

        it('should return 400 for an invalid enrollmentId', async () => {
            const response = await request(server)
                .delete('/api/v1/enrollments/abc')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 when no token is provided', async () => {
            const response = await request(server).delete(
                `/api/v1/enrollments/${enrollments.course.id}`,
            );

            expect(response.status).toBe(401);
        });

        it('should return 403 when a non-admin user tries to delete an enrollment', async () => {
            const response = await request(server)
                .delete(`/api/v1/enrollments/${enrollments.course.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');
        });

        it('should return 404 when the enrollment does not exist', async () => {
            const response = await request(server)
                .delete('/api/v1/enrollments/9999')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
        });
    });

    describe('POST /api/v1/enrollments/:enrollmentId/completed-modules', () => {
        it('should return 201 and mark a module as completed', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('progressPercentage');
            expect(response.body.data).toHaveProperty('completedModule');
        });

        it('should return 201 and mark the last module, completing the course', async () => {
            for (let i = 2; i < courseModules.length; i++) {
                await CompletedModule.create({
                    enrollmentId: enrollments.course.id,
                    courseModuleId: courseModules[i].id,
                    completedAt: new Date(),
                });
            }

            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(201);
            expect(response.body.data.progressPercentage).toBe('100.00');

            const updatedEnrollment = await Enrollment.findByPk(
                enrollments.course.id,
            );
            expect(updatedEnrollment.status).toBe('Completed');
        });

        it('should return 201 as admin for another user enrollment', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(201);
        });

        it('should return 400 for invalid enrollmentId', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments/abc/completed-modules')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid courseModuleId', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ courseModuleId: 'abc' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for a non-course enrollment', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.workshop.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(400);
        });

        it('should return 400 for an unpaid enrollment', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.unpaid.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(400);
        });

        it('should return 401 for unauthenticated user', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(401);
        });

        it('should return 403 for unauthorized user', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.another}`)
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(403);
        });

        it('should return 404 if enrollment does not exist', async () => {
            const response = await request(server)
                .post('/api/v1/enrollments/9999/completed-modules')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ courseModuleId: courseModules[0].id });

            expect(response.status).toBe(404);
        });

        it('should return 404 if module does not exist', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ courseModuleId: 9999 });

            expect(response.status).toBe(404);
        });

        it('should return 409 if module is already completed', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ courseModuleId: courseModules[1].id });

            expect(response.status).toBe(409);
        });

        it('should return 415 for invalid content type', async () => {
            const response = await request(server)
                .post(
                    `/api/v1/enrollments/${enrollments.course.id}/completed-modules`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .set('Content-Type', 'text/plain')
                .send('courseModuleId=1');

            expect(response.status).toBe(415);
        });
    });
});
