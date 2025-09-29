/* eslint-disable no-undef */
const request = require('supertest');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const AuthService = require('../../src/services/auth.service');
const { Enrollment } = require('../../src/db/models');
const programFactory = require('../../src/db/seeders/factories/program');
const userFactory = require('../../src/db/seeders/factories/user');
const courseFactory = require('../../src/db/seeders/factories/course');
const workshopFactory = require('../../src/db/seeders/factories/workshop');
const seminarFactory = require('../../src/db/seeders/factories/seminar');
const competitionFactory = require('../../src/db/seeders/factories/competition');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');

describe('Program Management Integration Tests', () => {
    const mockUserPassword = 'password123';
    let tokens, users, programs;

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
        const competitionProgram = await programFactory({
            type: 'Competition',
        });

        await courseFactory({ programId: courseProgram.id });
        await workshopFactory({ programId: workshopProgram.id });
        await seminarFactory({ programId: seminarProgram.id });
        await competitionFactory({ programId: competitionProgram.id });

        programs = {
            course: courseProgram,
            workshop: workshopProgram,
            seminar: seminarProgram,
            competition: competitionProgram,
        };

        await Enrollment.create({
            userId: users.regular.id,
            programId: programs.course.id,
            status: 'In Progress',
        });
        await Enrollment.create({
            userId: users.regular.id,
            programId: programs.workshop.id,
            status: 'In Progress',
        });
        await Enrollment.create({
            userId: users.regular.id,
            programId: programs.seminar.id,
            status: 'Completed',
        });
        await Enrollment.create({
            userId: users.regular.id,
            programId: programs.competition.id,
            status: 'In Progress',
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
                        currentRecords: 4,
                        totalRecords: 4,
                        currentPage: 1,
                        totalPages: 1,
                        nextPage: null,
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

    describe('GET /api/v1/programs/:programId', () => {
        it('should return 200 and fetches program details for an enrolled user', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.course.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved a program details.',
                    data: {
                        program: expect.objectContaining({
                            id: programs.course.id,
                            details: expect.any(Object),
                        }),
                    },
                    errors: null,
                }),
            );
        });

        it('should return 200 and fetches program workshop details for an enrolled user', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.workshop.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved a program details.',
                    data: {
                        program: expect.objectContaining({
                            id: programs.workshop.id,
                            details: expect.any(Object),
                        }),
                    },
                    errors: null,
                }),
            );
        });

        it('should return 200 and fetches program competition details for an enrolled user', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.competition.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved a program details.',
                    data: {
                        program: expect.objectContaining({
                            id: programs.competition.id,
                            details: expect.any(Object),
                        }),
                    },
                    errors: null,
                }),
            );
        });

        it('should return 200 and fetches program details for an admin', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.seminar.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.data.program.id).toBe(programs.seminar.id);
            expect(response.body.data.program.details).toBeDefined();
        });

        it('should return 400 when programId is not a valid integer', async () => {
            const response = await request(server)
                .get('/api/v1/programs/abc')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation error.');
        });

        it('should return 401 when no authorization token is provided', async () => {
            const response = await request(server).get(
                `/api/v1/programs/${programs.course.id}`,
            );

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });

        it('should return 403 for a user who is not enrolled', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.course.id}`)
                .set('Authorization', `Bearer ${tokens.another}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');
        });

        it('should return 404 when the program does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/programs/99999')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Resource not found.');
        });
    });

    describe('POST /api/v1/programs', () => {
        it('should return 201 and create a new Course program', async () => {
            const newProgram = {
                title: 'New Course Program',
                description: 'This is a new course program.',
                availableDate: '2025-10-10T00:00:00.000Z',
                type: 'Course',
                priceIdr: 150000,
            };

            const response = await request(server)
                .post('/api/v1/programs')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(newProgram);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 201,
                    message: 'Successfully created a program.',
                    data: {
                        program: expect.objectContaining({
                            title: newProgram.title,
                            type: newProgram.type,
                            details: {},
                        }),
                    },
                    errors: null,
                }),
            );
        });

        it('should return 201 and create a new Workshop program', async () => {
            const newProgram = {
                title: 'New Workshop Program',
                description: 'This is a new workshop program.',
                availableDate: '2025-11-11T00:00:00.000Z',
                type: 'Workshop',
                priceIdr: 250000,
                isOnline: true,
                videoConferenceUrl: 'http://zoom.us/new',
                facilitatorNames: ['Dr. Smith'],
            };

            const response = await request(server)
                .post('/api/v1/programs')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(newProgram);

            expect(response.status).toBe(201);
            expect(response.body.data.program.details).toEqual({
                isOnline: newProgram.isOnline,
                videoConferenceUrl: newProgram.videoConferenceUrl,
                locationAddress: undefined,
                facilitatorNames: newProgram.facilitatorNames,
            });
        });

        it('should return 201 and create a new Seminar program', async () => {
            const newProgram = {
                title: 'New Seminar Program',
                description: 'This is a new seminar program.',
                availableDate: '2025-11-11T00:00:00.000Z',
                type: 'Seminar',
                priceIdr: 250000,
                isOnline: true,
                videoConferenceUrl: 'http://zoom.us/new',
                speakerNames: ['Dr. Smith'],
            };

            const response = await request(server)
                .post('/api/v1/programs')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(newProgram);

            expect(response.status).toBe(201);
            expect(response.body.data.program.details).toEqual({
                isOnline: newProgram.isOnline,
                videoConferenceUrl: newProgram.videoConferenceUrl,
                locationAddress: undefined,
                speakerNames: newProgram.speakerNames,
            });
        });

        it('should return 201 and create a new Competition program', async () => {
            const newProgram = {
                type: 'Competition',
                title: 'UNTAN Programming Contest V',
                description:
                    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.',
                availableDate: '2025-10-11',
                priceIdr: 50000,
                isOnline: false,
                locationAddress:
                    'W8RW+PHQ, Bansir Laut, Pontianak Tenggara, Pontianak, West Kalimantan 78115',
                contestRoomUrl: 'https://codeforces.com/contests/2152',
                hostName: 'Program Studi Informatika, Universitas Tanjungpura',
                totalPrize: 15000000,
            };

            const response = await request(server)
                .post('/api/v1/programs')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(newProgram);

            expect(response.status).toBe(201);
            expect(response.body.data.program.details).toEqual({
                isOnline: false,
                locationAddress:
                    'W8RW+PHQ, Bansir Laut, Pontianak Tenggara, Pontianak, West Kalimantan 78115',
                contestRoomUrl: 'https://codeforces.com/contests/2152',
                hostName: 'Program Studi Informatika, Universitas Tanjungpura',
                totalPrize: 15000000,
            });
        });

        it('should return 400 for invalid program data', async () => {
            const invalidProgram = {
                title: 'Invalid Program',
            };

            const response = await request(server)
                .post('/api/v1/programs')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(invalidProgram);

            expect(response.status).toBe(400);
        });

        it('should return 403 for a regular user trying to create a program', async () => {
            const newProgram = {
                title: 'Forbidden Program',
                description: 'This should not be created.',
                availableDate: '2025-12-12T00:00:00.000Z',
                type: 'Course',
                priceIdr: 50000,
            };

            const response = await request(server)
                .post('/api/v1/programs')
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send(newProgram);

            expect(response.status).toBe(403);
        });
    });
});
