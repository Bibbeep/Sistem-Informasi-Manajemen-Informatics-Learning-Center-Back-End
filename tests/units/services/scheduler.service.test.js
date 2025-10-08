/* eslint-disable no-undef */
jest.mock('node-cron', () => {
    return {
        schedule: jest.fn(),
    };
});
jest.mock('chalk', () => {
    return {
        blue: jest.fn(),
        yellow: jest.fn(),
    };
});
jest.mock('../../../src/db/models', () => {
    return {
        Invoice: {
            findAll: jest.fn(),
            update: jest.fn(),
        },
        Enrollment: {
            update: jest.fn(),
        },
        sequelize: {
            transaction: jest.fn((callback) => {
                return callback();
            }),
        },
        Op: {
            lte: Symbol('lte'),
        },
    };
});

const cron = require('node-cron');
const chalk = require('chalk');
const { Op } = require('sequelize');
const SchedulerService = require('../../../src/services/scheduler.service');
const { Invoice, Enrollment, sequelize } = require('../../../src/db/models');

describe('Scheduler Service Unit Tests', () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(
            new Date('2025-10-08T15:00:00.000Z'),
        );
    });

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
        SchedulerService.cronJob = null;
    });

    afterAll(() => {
        jest.useRealTimers();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('start', () => {
        it('should not start a new job if one is already running', () => {
            const mockCronJob = { destroy: jest.fn() };
            cron.schedule.mockReturnValue(mockCronJob);

            SchedulerService.start();
            SchedulerService.start();

            expect(cron.schedule).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenNthCalledWith(
                1,
                chalk.blue('[Cron Job]'),
                'Job is starting',
            );
            expect(consoleLogSpy).toHaveBeenNthCalledWith(
                2,
                chalk.yellow('[Cron Job]'),
                'Job is already running',
            );
        });
        it('should run cron job and update expired invoices and enrollments', async () => {
            const mockExpiredInvoices = [
                { id: 1, enrollmentId: 101 },
                { id: 2, enrollmentId: 102 },
            ];
            const mockCronJob = { destroy: jest.fn() };
            Invoice.findAll.mockResolvedValue(mockExpiredInvoices);
            cron.schedule.mockReturnValue(mockCronJob);

            SchedulerService.start();

            const cronCallback = cron.schedule.mock.calls[0][1];
            await cronCallback();

            expect(cron.schedule).toHaveBeenCalledWith(
                '* * * * *',
                expect.any(Function),
            );
            expect(consoleLogSpy).toHaveBeenCalledWith(
                chalk.blue('[Cron Job]'),
                'Job is starting',
            );

            expect(Invoice.findAll).toHaveBeenCalledWith(
                {
                    where: {
                        status: 'Unverified',
                        paymentDueDatetime: {
                            [Op.lte]: new Date(),
                        },
                    },
                },
                { transaction: undefined },
            );

            expect(Invoice.update).toHaveBeenCalledWith(
                { status: 'Expired' },
                { where: { id: [1, 2] }, transaction: undefined },
            );

            expect(Enrollment.update).toHaveBeenCalledWith(
                { status: 'Expired' },
                { where: { id: [101, 102] }, transaction: undefined },
            );
        });

        it('should run cron job and do nothing when no expired invoices are found', async () => {
            Invoice.findAll.mockResolvedValue([]);

            SchedulerService.start();

            const cronCallback = cron.schedule.mock.calls[0][1];
            await cronCallback();

            expect(Invoice.findAll).toHaveBeenCalled();
            expect(Invoice.update).not.toHaveBeenCalled();
            expect(Enrollment.update).not.toHaveBeenCalled();
        });

        it('should log an error if the transaction fails', async () => {
            const mockError = new Error('Database transaction failed');
            // eslint-disable-next-line no-unused-vars
            sequelize.transaction.mockImplementationOnce(async (callback) => {
                throw mockError;
            });

            SchedulerService.start();

            const cronCallback = cron.schedule.mock.calls[0][1];
            await cronCallback();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[Cron Job] Error:',
                mockError,
            );
        });
    });

    describe('stop', () => {
        it('should stop the running cron job', () => {
            const mockCronJob = { destroy: jest.fn() };
            cron.schedule.mockReturnValue(mockCronJob);

            SchedulerService.start();
            SchedulerService.stop();

            expect(consoleLogSpy).toHaveBeenNthCalledWith(
                2,
                chalk.blue('[Cron Job]'),
                'Job is stopping',
            );
            expect(mockCronJob.destroy).toHaveBeenCalled();
        });

        it('should do nothing if no job is running', () => {
            SchedulerService.stop();

            expect(consoleLogSpy).not.toHaveBeenCalledWith(
                chalk.blue('[Cron Job]'),
                'Job is stopping',
            );
        });
    });
});
