/* eslint-disable no-undef */
jest.mock('../../src/app');
jest.mock('../../src/configs/database');
jest.mock('../../src/configs/redis');
jest.mock('../../src/configs/nodemailer');
jest.mock('../../src/configs/s3');
jest.mock('../../src/services/scheduler.service');
jest.mock('chalk');
const { app } = require('../../src/app');
const { connectDb } = require('../../src/configs/database');
const { connectRedis } = require('../../src/configs/redis');
const { connectNodemailer } = require('../../src/configs/nodemailer');
const { connectS3 } = require('../../src/configs/s3');
const SchedulerService = require('../../src/services/scheduler.service');
const chalk = require('chalk');

describe('Server Unit Tests', () => {
    let mockServer;
    const originalEnv = process.env;
    let consoleLogSpy;

    beforeEach(() => {
        process.env = { ...originalEnv };
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        mockServer = {
            close: jest.fn(),
        };

        app.listen = jest.fn((port, callback) => {
            setTimeout(callback, 0);
            return mockServer;
        });

        connectDb.mockResolvedValue();
        connectRedis.mockResolvedValue();
        connectNodemailer.mockResolvedValue();
        connectS3.mockResolvedValue();
        SchedulerService.start = jest.fn();

        chalk.inverse = {
            bold: jest.fn((msg) => {
                return msg;
            }),
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
        jest.resetModules();
        consoleLogSpy.mockRestore();
    });

    it('should start scheduler in non-test environment', (done) => {
        process.env.NODE_ENV = 'development';
        process.env.PORT = '3000';

        const serverModule = require('../../src/server');

        setTimeout(() => {
            expect(app.listen).toHaveBeenCalledWith(
                '3000',
                expect.any(Function),
            );
            expect(connectDb).toHaveBeenCalled();
            expect(connectRedis).toHaveBeenCalled();
            expect(connectNodemailer).toHaveBeenCalled();
            expect(connectS3).toHaveBeenCalled();
            expect(SchedulerService.start).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith(
                'Server is listening on port 3000',
            );

            if (serverModule.server) {
                serverModule.server.close();
            }
            done();
        }, 100);
    });

    it('should not start scheduler in test environment', (done) => {
        process.env.NODE_ENV = 'test';
        process.env.PORT = '3000';
        const serverModule = require('../../src/server');

        setTimeout(() => {
            expect(app.listen).toHaveBeenCalledWith(
                '3000',
                expect.any(Function),
            );
            expect(connectDb).toHaveBeenCalled();
            expect(connectRedis).toHaveBeenCalled();
            expect(connectNodemailer).toHaveBeenCalled();
            expect(connectS3).toHaveBeenCalled();
            expect(SchedulerService.start).not.toHaveBeenCalled();
            expect(consoleLogSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('Server is listening'),
            );

            if (serverModule.server) {
                serverModule.server.close();
            }
            done();
        }, 100);
    });

    it('should use default port when PORT env is not set', (done) => {
        delete process.env.PORT;
        process.env.NODE_ENV = 'development';
        const serverModule = require('../../src/server');

        setTimeout(() => {
            expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));

            if (serverModule.server) {
                serverModule.server.close();
            }
            done();
        }, 100);
    });
});
