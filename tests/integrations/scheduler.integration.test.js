/* eslint-disable no-undef */
const { faker } = require('@faker-js/faker');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const programFactory = require('../../src/db/seeders/factories/program');
const enrollmentFactory = require('../../src/db/seeders/factories/enrollment');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const { Invoice, Enrollment } = require('../../src/db/models');
const SchedulerService = require('../../src/services/scheduler.service');

let cronTask;
jest.mock('node-cron', () => {
    return {
        schedule: jest.fn((pattern, task) => {
            cronTask = task;
            return {
                start: () => {},
                stop: () => {},
            };
        }),
    };
});

describe('Scheduler Integration Tests', () => {
    let consoleErrorSpy;

    afterAll(async () => {
        server.close();
        jest.restoreAllMocks();
        await sequelize.close();
        await redisClient.close();
    });

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(async () => {
        await truncate();
        jest.clearAllMocks();
    });

    it('should update expired invoices and enrollments', async () => {
        const user = await userFactory();
        const program = await programFactory({ priceIdr: 100000 });

        const expiredEnrollment = await enrollmentFactory({
            userId: user.id,
            programId: program.id,
            status: 'Unpaid',
        });
        await Invoice.create({
            enrollmentId: expiredEnrollment.id,
            amountIdr: 100000,
            status: 'Unverified',
            paymentDueDatetime: faker.date.past(),
        });

        const activeEnrollment = await enrollmentFactory({
            userId: user.id,
            programId: program.id,
            status: 'Unpaid',
        });
        await Invoice.create({
            enrollmentId: activeEnrollment.id,
            amountIdr: 100000,
            status: 'Unverified',
            paymentDueDatetime: faker.date.future(),
        });

        const verifiedEnrollment = await enrollmentFactory({
            userId: user.id,
            programId: program.id,
            status: 'In Progress',
        });
        await Invoice.create({
            enrollmentId: verifiedEnrollment.id,
            amountIdr: 100000,
            status: 'Verified',
            paymentDueDatetime: faker.date.past(),
        });

        SchedulerService.start();
        await cronTask();

        const expiredInvoiceAfter = await Invoice.findOne({
            where: { enrollmentId: expiredEnrollment.id },
        });
        const expiredEnrollmentAfter = await Enrollment.findByPk(
            expiredEnrollment.id,
            {
                paranoid: false,
            },
        );
        expect(expiredInvoiceAfter.status).toBe('Expired');
        expect(expiredEnrollmentAfter.status).toBe('Expired');

        const activeInvoiceAfter = await Invoice.findOne({
            where: { enrollmentId: activeEnrollment.id },
        });
        const activeEnrollmentAfter = await Enrollment.findByPk(
            activeEnrollment.id,
        );
        expect(activeInvoiceAfter.status).toBe('Unverified');
        expect(activeEnrollmentAfter.status).toBe('Unpaid');

        const verifiedInvoiceAfter = await Invoice.findOne({
            where: { enrollmentId: verifiedEnrollment.id },
        });
        const verifiedEnrollmentAfter = await Enrollment.findByPk(
            verifiedEnrollment.id,
        );
        expect(verifiedInvoiceAfter.status).toBe('Verified');
        expect(verifiedEnrollmentAfter.status).toBe('In Progress');

        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should do nothing if there are no expired invoices', async () => {
        const user = await userFactory();
        const program = await programFactory({ priceIdr: 100000 });

        const activeEnrollment = await enrollmentFactory({
            userId: user.id,
            programId: program.id,
            status: 'Unpaid',
        });
        await Invoice.create({
            enrollmentId: activeEnrollment.id,
            amountIdr: 100000,
            status: 'Unverified',
            paymentDueDatetime: faker.date.future(),
        });

        SchedulerService.start();
        await cronTask();

        const activeInvoiceAfter = await Invoice.findOne({
            where: { enrollmentId: activeEnrollment.id },
        });
        const activeEnrollmentAfter = await Enrollment.findByPk(
            activeEnrollment.id,
        );
        expect(activeInvoiceAfter.status).toBe('Unverified');
        expect(activeEnrollmentAfter.status).toBe('Unpaid');
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully during the transaction', async () => {
        const user = await userFactory();
        const program = await programFactory({ priceIdr: 100000 });
        const enrollment = await enrollmentFactory({
            userId: user.id,
            programId: program.id,
            status: 'Unpaid',
        });
        await Invoice.create({
            enrollmentId: enrollment.id,
            amountIdr: 100000,
            status: 'Unverified',
            paymentDueDatetime: faker.date.past(),
        });

        const updateStub = jest
            .spyOn(Invoice, 'update')
            .mockImplementation(() => {
                throw new Error('Database error');
            });

        SchedulerService.start();
        await cronTask();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[Cron Job] Error:',
            expect.any(Error),
        );
        expect(consoleErrorSpy.mock.calls[0][1].message).toBe('Database error');

        const invoiceAfter = await Invoice.findOne({
            where: { enrollmentId: enrollment.id },
        });
        expect(invoiceAfter.status).toBe('Unverified');

        updateStub.mockRestore();
    });
});
