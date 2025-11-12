/* eslint-disable no-undef */
jest.mock('../../src/utils/printPdf');
jest.mock('@aws-sdk/lib-storage');
jest.mock('@aws-sdk/client-s3', () => {
    return {
        ...jest.requireActual('@aws-sdk/client-s3'),
        DeleteObjectCommand: jest.fn(),
    };
});
jest.mock('../../src/configs/s3', () => {
    return {
        ...jest.requireActual('../../src/configs/s3'),
        s3: {
            send: jest.fn(),
        },
    };
});

const request = require('supertest');
const { server } = require('../../src/server');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const programFactory = require('../../src/db/seeders/factories/program');
const enrollmentFactory = require('../../src/db/seeders/factories/enrollment');
const certificateFactory = require('../../src/db/seeders/factories/certificate');
const AuthService = require('../../src/services/auth.service');
const printPdf = require('../../src/utils/printPdf');
const { Upload } = require('@aws-sdk/lib-storage');
const { s3 } = require('../../src/configs/s3');
const { faker } = require('@faker-js/faker');

describe('Certificate Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens, programs, certificates;

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

        const program1 = await programFactory({ type: 'Course' });
        const program2 = await programFactory({ type: 'Workshop' });

        programs = [program1, program2];

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
            issuedAt: faker.date.future({ years: 3, refDate: new Date() }),
            documentUrl:
                'https://fake-s3.com/documents/certificates/cert-to-delete.pdf',
        });
        const cert2 = await certificateFactory({
            enrollmentId: enrollment2.id,
            userId: users.another.id,
        });

        certificates = [cert1, cert2];

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
                        Location: 'https://fake-s3.com/updated-cert.pdf',
                    });
                },
            };
        });
        s3.send.mockResolvedValue({});
    });

    afterEach(async () => {
        await truncate();
        jest.clearAllMocks();
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

    describe('GET /api/v1/certificates/:certificateId', () => {
        it('should return 200 when accessing own certificate as regular user', async () => {
            const response = await request(server)
                .get(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.certificate).toBeDefined();
        });

        it("should return 403 when trying to access another user's certificate", async () => {
            const response = await request(server)
                .get(`/api/v1/certificates/${certificates[1].id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return 404 when certificate does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/certificates/999')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.statusCode).toBe(404);
        });

        it('should return 404 when certificate does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/certificates/999')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /api/v1/certificates', () => {
        let completedEnrollment,
            enrollmentWithCert,
            inProgressEnrollment,
            enrollmentWithExpiredCert;

        beforeEach(async () => {
            completedEnrollment = await enrollmentFactory({
                userId: users.another.id,
                programId: programs[0].id,
                status: 'Completed',
            });

            enrollmentWithCert = await enrollmentFactory({
                userId: users.another.id,
                programId: programs[1].id,
                status: 'Completed',
            });
            await certificateFactory({
                enrollmentId: enrollmentWithCert.id,
                userId: users.another.id,
            });

            inProgressEnrollment = await enrollmentFactory({
                userId: users.regular.id,
                programId: programs[1].id,
                status: 'In Progress',
            });

            enrollmentWithExpiredCert = await enrollmentFactory({
                userId: users.another.id,
                programId: programs[0].id,
                status: 'Completed',
            });
            await certificateFactory({
                enrollmentId: enrollmentWithExpiredCert.id,
                userId: users.another.id,
                expiredAt: faker.date.past(),
            });
        });

        it('should return 201 and create a certificate successfully', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ enrollmentId: completedEnrollment.id });

            expect(response.status).toBe(201);
            expect(response.body.data.certificate).toBeDefined();
            expect(response.body.data.certificate.enrollmentId).toBe(
                completedEnrollment.id,
            );
            expect(printPdf).toHaveBeenCalledTimes(1);
            expect(Upload).toHaveBeenCalledTimes(1);
        }, 10000);

        it('should return 201 with custom title, issuedAt, and expiredAt', async () => {
            const customData = {
                enrollmentId: completedEnrollment.id,
                title: 'Special Certificate of Awesomeness',
                issuedAt: '2025-12-01T00:00:00.000Z',
                expiredAt: '2027-12-01T00:00:00.000Z',
            };

            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(customData);

            expect(response.status).toBe(201);
            expect(response.body.data.certificate.title).toBe(customData.title);
            expect(response.body.data.certificate.issuedAt).toBe(
                customData.issuedAt,
            );
            expect(response.body.data.certificate.expiredAt).toBe(
                customData.expiredAt,
            );
        }, 10000);

        it('should return 201 for an enrollment with an already expired certificate', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ enrollmentId: enrollmentWithExpiredCert.id });

            expect(response.status).toBe(201);
            expect(response.body.data.certificate).toBeDefined();
        }, 10000);

        it('should return 401 for an unauthenticated request', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .send({ enrollmentId: completedEnrollment.id });

            expect(response.status).toBe(401);
        });

        it('should return 403 for a non-admin user', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ enrollmentId: completedEnrollment.id });

            expect(response.status).toBe(403);
        });

        it('should return 400 for an invalid request body', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ enrollmentId: 'not-a-number' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 404 if the enrollment does not exist', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ enrollmentId: 99999 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
            expect(response.body.errors[0].message).toContain('does not exist');
        });

        it('should return 409 if an active certificate already exists', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ enrollmentId: enrollmentWithCert.id });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Resource conflict.');
            expect(response.body.errors[0].message).toContain(
                'active certificate',
            );
        });

        it('should return 400 if the enrollment status is not "Completed"', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ enrollmentId: inProgressEnrollment.id });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
            expect(response.body.errors[0].message).toContain(
                'must be "Completed"',
            );
        });

        it('should return 415 for incorrect content-type', async () => {
            const response = await request(server)
                .post('/api/v1/certificates')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .set('Content-Type', 'text/plain')
                .send(`enrollmentId=${completedEnrollment.id}`);

            expect(response.status).toBe(415);
        });
    });

    describe('PATCH /api/v1/certificates/:certificateId', () => {
        it('should return 200 and update the certificate title', async () => {
            const updateData = { title: 'New Certificate Title' };
            const response = await request(server)
                .patch(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data.certificate.title).toBe(updateData.title);
            expect(printPdf).toHaveBeenCalledTimes(1);
            expect(Upload).toHaveBeenCalledTimes(1);
        }, 10000);

        it('should return 200 and update the certificate expiredAt', async () => {
            const updateData = {
                expiredAt: faker.date.future({
                    years: 1,
                    refDate: certificates[0].issuedAt,
                }),
            };
            const response = await request(server)
                .patch(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
        }, 10000);

        it('should return 400 for invalid certificate ID', async () => {
            const response = await request(server)
                .patch('/api/v1/certificates/abc')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: 'New Title' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 400 for invalid request body', async () => {
            const response = await request(server)
                .patch(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: 12345 });

            expect(response.status).toBe(400);
        });

        it('should return 400 when expiredAt is earlier than issuedAt', async () => {
            const response = await request(server)
                .patch(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({
                    expiredAt: faker.date
                        .past({
                            years: 1,
                            refDate: certificates[0].issuedAt,
                        })
                        .toISOString(),
                });

            expect(response.status).toBe(400);
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(server)
                .patch(`/api/v1/certificates/${certificates[0].id}`)
                .send({ title: 'New Title' });

            expect(response.status).toBe(401);
        });

        it('should return 403 for non-admin users', async () => {
            const response = await request(server)
                .patch(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ title: 'New Title' });

            expect(response.status).toBe(403);
        });

        it('should return 404 if the certificate does not exist', async () => {
            const response = await request(server)
                .patch('/api/v1/certificates/99999')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: 'New Title' });

            expect(response.status).toBe(404);
        });

        it('should return 415 for incorrect content-type', async () => {
            const response = await request(server)
                .patch(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .set('Content-Type', 'text/plain')
                .send('title=New Certificate Title');

            expect(response.status).toBe(415);
        });
    });

    describe('DELETE /api/v1/certificates/:certificateId', () => {
        it('should return 200 and delete the certificate successfully', async () => {
            const response = await request(server)
                .delete(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(
                'Successfully deleted a certificate.',
            );
            expect(s3.send).toHaveBeenCalledTimes(1);
        });

        it('should return 200 even if the certificate has no documentUrl', async () => {
            const certWithoutDoc = await certificateFactory({
                enrollmentId: certificates[0].enrollmentId,
                userId: certificates[0].userId,
                documentUrl: null,
            });

            const response = await request(server)
                .delete(`/api/v1/certificates/${certWithoutDoc.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(s3.send).not.toHaveBeenCalled();
        });

        it('should return 400 for an invalid certificate ID', async () => {
            const response = await request(server)
                .delete('/api/v1/certificates/abc')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 for an unauthenticated request', async () => {
            const response = await request(server).delete(
                `/api/v1/certificates/${certificates[0].id}`,
            );

            expect(response.status).toBe(401);
        });

        it('should return 403 for a non-admin user', async () => {
            const response = await request(server)
                .delete(`/api/v1/certificates/${certificates[0].id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 if the certificate does not exist', async () => {
            const response = await request(server)
                .delete('/api/v1/certificates/99999')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
        });
    });
});
