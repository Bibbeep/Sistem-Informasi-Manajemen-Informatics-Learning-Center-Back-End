/* eslint-disable no-undef */
const request = require('supertest');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const programFactory = require('../../src/db/seeders/factories/program');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');

describe('Program Management Integration Tests', () => {
    afterAll(async () => {
        server.close();
        await sequelize.close();
        await redisClient.close();
    });

    beforeEach(async () => {
        for (let i = 0; i < 20; i++) {
            await programFactory();
        }
    });

    afterEach(async () => {
        await truncate();
        jest.clearAllMocks();
    });

    describe('GET /api/v1/programs', () => {
        it('should return 200 and fetches all program data with default query params', async () => {
            const response = await request(server).get('/api/v1/programs');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all programs.',
                    data: {
                        programs: expect.any(Array),
                    },
                    pagination: {
                        currentRecords: 10,
                        totalRecords: 20,
                        currentPage: 1,
                        totalPages: 2,
                        nextPage: 2,
                        prevPage: null,
                    },
                    errors: null,
                }),
            );
        });

        it('should return 200 and fetches all program data with query params', async () => {
            const response = await request(server).get(
                '/api/v1/programs?sort=-price&limit=5&page=2&type=course&price.gte=100000&price.lte=4000000',
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all programs.',
                    data: {
                        programs: expect.any(Array),
                    },
                    pagination: expect.any(Object),
                    errors: null,
                }),
            );
        });

        it('should return 200 and fetches empty programs with out of bound page number', async () => {
            const response = await request(server).get(
                '/api/v1/programs?page=100',
            );

            expect(response.status).toBe(200);
            expect(response.body.data.programs.length).toBe(0);
        });

        it('should return 400 with invalid query params', async () => {
            const response = await request(server).get(
                '/api/v1/programs?sort=abc&limit=0&page=0&type=backend&price.gte=-1&price.lte=0',
            );

            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 400,
                    data: null,
                    message: 'Validation error.',
                    errors: expect.any(Array),
                }),
            );
        });
    });
});
