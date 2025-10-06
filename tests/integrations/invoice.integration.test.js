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
const { Invoice, Payment, Enrollment } = require('../../src/db/models');

describe('Invoice Integration Tests', () => {
    const mockUserPassword = 'password123';
    let users, tokens, invoices;

    afterAll(async () => {
        server.close();
        await sequelize.close();
        await redisClient.close();
    });

    beforeEach(async () => {
        await truncate();
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

        const program1 = await programFactory({
            type: 'Course',
            priceIdr: 100000,
        });
        const program2 = await programFactory({
            type: 'Workshop',
            priceIdr: 200000,
        });

        const enrollment1 = await enrollmentFactory({
            userId: users.regular.id,
            programId: program1.id,
        });
        const enrollment2 = await enrollmentFactory({
            userId: users.another.id,
            programId: program2.id,
        });
        const enrollment3 = await enrollmentFactory({
            userId: users.regular.id,
            programId: program2.id,
        });

        const invoice1 = await Invoice.create({
            enrollmentId: enrollment1.id,
            amountIdr: 100000,
            status: 'Verified',
        });
        const invoice2 = await Invoice.create({
            enrollmentId: enrollment2.id,
            amountIdr: 200000,
            status: 'Unverified',
        });
        const invoice3 = await Invoice.create({
            enrollmentId: enrollment3.id,
            amountIdr: 200000,
            status: 'Expired',
        });

        await Payment.create({
            invoiceId: invoice1.id,
            amountPaidIdr: invoice1.amountIdr,
        });

        invoices = [invoice1, invoice2, invoice3];

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

    describe('GET /api/v1/invoices', () => {
        it('should return 200 and all invoices for admin', async () => {
            const response = await request(server)
                .get('/api/v1/invoices?sort=paymentDue')
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(200);
            expect(response.body.data.invoices.length).toBe(3);
        });

        it('should return 200 and user-specific invoices for a regular user', async () => {
            const response = await request(server)
                .get(`/api/v1/invoices?userId=${users.regular.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(200);
            expect(response.body.data.invoices.length).toBe(2);
        });

        it('should return 200 and apply filters correctly', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/invoices?userId=${users.regular.id}&status=verified&type=course`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(200);
            expect(response.body.data.invoices.length).toBe(1);
            expect(response.body.data.invoices[0].status).toBe('Verified');
            expect(response.body.data.invoices[0].programType).toBe('Course');
        });

        it('should return 200 and sort data correctly', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/invoices?userId=${users.regular.id}&sort=-createdAt`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(200);
            const invoices = response.body.data.invoices;
            expect(
                new Date(invoices[0].createdAt) >
                    new Date(invoices[1].createdAt),
            ).toBe(true);
        });

        it('should return 200 and handle pagination correctly', async () => {
            const response = await request(server)
                .get('/api/v1/invoices?limit=1&page=2')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.invoices.length).toBe(1);
            expect(response.body.pagination.currentPage).toBe(2);
        });

        it('should return 200 with no records when page is out of bounds', async () => {
            const response = await request(server)
                .get('/api/v1/invoices?limit=1&page=100')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.invoices.length).toBe(0);
        });

        it('should return 400 for invalid query parameters', async () => {
            const response = await request(server)
                .get('/api/v1/invoices?sort=invalidSort')
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(400);
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(server).get('/api/v1/invoices');
            expect(response.status).toBe(401);
        });

        it('should return 403 when a regular user tries to access without userId', async () => {
            const response = await request(server)
                .get('/api/v1/invoices')
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(403);
        });

        it('should return 403 when a regular user tries to access another user invoice data', async () => {
            const response = await request(server)
                .get(`/api/v1/invoices?userId=${users.another.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(403);
        });

        it('should return invoices without payment details if they are null', async () => {
            await Invoice.destroy({ where: {} });
            const enrollment = await Enrollment.findOne();
            await Invoice.create({
                enrollmentId: enrollment.id,
                amountIdr: 100000,
            });
            const response = await request(server)
                .get('/api/v1/invoices')
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(200);
            const invoice = response.body.data.invoices;
            expect(invoice[0].payment).toBeNull();
        });
    });

    describe('GET /api/v1/invoices/:invoiceId', () => {
        it('should return 200 and invoice details for an admin', async () => {
            const response = await request(server)
                .get(`/api/v1/invoices/${invoices[0].id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(200);
            expect(response.body.data.invoice.id).toBe(invoices[0].id);
        });

        it('should return 200 and invoice details for the owner', async () => {
            const response = await request(server)
                .get(`/api/v1/invoices/${invoices[0].id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(200);
            expect(response.body.data.invoice.id).toBe(invoices[0].id);
        });

        it('should return 200 for an invoice without a payment record', async () => {
            const response = await request(server)
                .get(`/api/v1/invoices/${invoices[1].id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(200);
            expect(response.body.data.invoice.payment).toBeNull();
        });

        it('should return 400 for an invalid invoiceId', async () => {
            const response = await request(server)
                .get('/api/v1/invoices/abc')
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(400);
        });

        it('should return 401 for an unauthenticated request', async () => {
            const response = await request(server).get(
                `/api/v1/invoices/${invoices[0].id}`,
            );
            expect(response.status).toBe(401);
        });

        it("should return 403 when a regular user tries to access another user's invoice", async () => {
            const response = await request(server)
                .get(`/api/v1/invoices/${invoices[1].id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(403);
        });

        it("should return 403 when a regular user tries to access another user's invoice by using query parameter", async () => {
            const response = await request(server)
                .get(`/api/v1/invoices/${invoices[1].id}?userId=2`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(403);
        });

        it('should return 404 when the invoice does not exist for admin', async () => {
            const response = await request(server)
                .get('/api/v1/invoices/99999')
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(404);
        });

        it('should return 404 when the invoice does not exist for user', async () => {
            const response = await request(server)
                .get('/api/v1/invoices/99999')
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(404);
        });

        it('should return 404 if the service cannot find the owner (e.g., enrollment deleted)', async () => {
            await Enrollment.destroy({
                where: { id: invoices[0].enrollmentId },
            });
            const response = await request(server)
                .get(`/api/v1/invoices/${invoices[0].id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/v1/invoices/:invoiceId', () => {
        it('should return 200 and delete invoice data', async () => {
            const response = await request(server)
                .delete('/api/v1/invoices/3')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully deleted an invoice.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should return 400 when invoiceId is invalid', async () => {
            const response = await request(server)
                .delete('/api/v1/invoices/abc')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.statusCode).toBe(400);
        });

        it('should return 401 when invalid access token', async () => {
            const response = await request(server)
                .delete('/api/v1/invoices/1')
                .set('Authorization', `Bearer invalid`);

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 when forbidden access', async () => {
            const response = await request(server)
                .delete('/api/v1/invoices/2')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return 404 when invoice does not exist', async () => {
            const response = await request(server)
                .delete('/api/v1/invoices/404')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /api/v1/invoices/:invoiceId/payments', () => {
        it('should return 201 and create payment', async () => {
            const response = await request(server)
                .post('/api/v1/invoices/2/payments')
                .set('Authorization', `Bearer ${tokens.another}`);

            expect(response.statusCode).toBe(201);
        });

        it('should return 400 when invalid invoiceId', async () => {
            const response = await request(server)
                .post('/api/v1/invoices/abc/payments')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.statusCode).toBe(400);
        });

        it('should return 400 when invoice is expired', async () => {
            const response = await request(server)
                .post('/api/v1/invoices/3/payments')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.statusCode).toBe(400);
        });

        it('should return 401 when invalid access token', async () => {
            const response = await request(server)
                .post('/api/v1/invoices/1/payments')
                .set('Authorization', `Bearer abcde`);

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 when forbidden access', async () => {
            const response = await request(server)
                .post('/api/v1/invoices/2/payments')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.statusCode).toBe(403);
        });

        it('should return 404 when invoice does not exist', async () => {
            const response = await request(server)
                .post('/api/v1/invoices/404/payments')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.statusCode).toBe(404);
        });

        it('should return 409 when payment is already made', async () => {
            const response = await request(server)
                .post('/api/v1/invoices/1/payments')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.statusCode).toBe(409);
        });
    });
});
