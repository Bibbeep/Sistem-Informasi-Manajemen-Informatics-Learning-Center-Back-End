/* eslint-disable no-undef */
const request = require('supertest');
const path = require('path');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const AuthService = require('../../src/services/auth.service');
const { Enrollment, Course, CourseModule } = require('../../src/db/models');
const programFactory = require('../../src/db/seeders/factories/program');
const userFactory = require('../../src/db/seeders/factories/user');
const courseFactory = require('../../src/db/seeders/factories/course');
const workshopFactory = require('../../src/db/seeders/factories/workshop');
const seminarFactory = require('../../src/db/seeders/factories/seminar');
const competitionFactory = require('../../src/db/seeders/factories/competition');
const { sequelize } = require('../../src/configs/database');
const { redisClient } = require('../../src/configs/redis');
const { createPublicTestBucket } = require('../../src/configs/s3TestSetup');
const { fakerID_ID: faker } = require('@faker-js/faker');

describe('Program Management Integration Tests', () => {
    const mockUserPassword = 'password123';
    let tokens, users, programs;
    const originalBucketName = process.env.S3_BUCKET_NAME;

    beforeAll(async () => {
        await createPublicTestBucket();
    });

    afterAll(async () => {
        server.close();
        await sequelize.close();
        await redisClient.close();
        process.env.S3_BUCKET_NAME = originalBucketName;
    });

    beforeEach(async () => {
        process.env.S3_BUCKET_NAME = process.env.S3_TEST_BUCKET_NAME;
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

        it('should return 200 and fetches a program with id query param', async () => {
            const response = await request(server).get('/api/v1/programs?id=1');

            expect(response.status).toBe(200);
            expect(response.body.data.programs.length).toBe(1);
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
                availableDate: faker.date.future(),
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
                availableDate: faker.date.future(),
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
                availableDate: faker.date.future(),
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
                availableDate: faker.date.future(),
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

    describe('PATCH /api/v1/programs/:programId', () => {
        it('should return 200 and update a Course program', async () => {
            const updateData = {
                title: 'Updated Course Title',
                type: 'Course',
            };

            const response = await request(server)
                .patch(`/api/v1/programs/${programs.course.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data.program.title).toBe(updateData.title);
        });

        it('should return 200 and update a Seminar program', async () => {
            const updateData = {
                type: 'Seminar',
                speakerNames: ['Dr. Strange', 'Wong'],
            };

            const response = await request(server)
                .patch(`/api/v1/programs/${programs.seminar.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data.program.details.speakerNames).toEqual(
                updateData.speakerNames,
            );
        });

        it('should return 200 and update a Workshop program', async () => {
            const updateData = {
                type: 'Workshop',
                facilitatorNames: ['Dr. Strange', 'Wong'],
            };

            const response = await request(server)
                .patch(`/api/v1/programs/${programs.workshop.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data.program.details.facilitatorNames).toEqual(
                updateData.facilitatorNames,
            );
        });

        it('should return 200 and update a Competition program', async () => {
            const updateData = {
                type: 'Competition',
                totalPrize: 1000000,
                hostName: 'The Avengers',
            };

            const response = await request(server)
                .patch(`/api/v1/programs/${programs.competition.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data.program.details.totalPrize).toEqual(
                updateData.totalPrize,
            );
            expect(response.body.data.program.details.hostName).toEqual(
                updateData.hostName,
            );
        });

        it('should return 400 when trying to change program type', async () => {
            const updateData = {
                type: 'Workshop',
                title: 'Not a Workshop, actually',
            };

            const response = await request(server)
                .patch(`/api/v1/programs/${programs.course.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(updateData);

            expect(response.status).toBe(400);
        });

        it('should return 400 when programId is not a valid integer', async () => {
            const response = await request(server)
                .patch('/api/v1/programs/abc')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ type: 'Course' });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid request body', async () => {
            const response = await request(server)
                .patch(`/api/v1/programs/${programs.course.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: 123, type: 'Course' });

            expect(response.status).toBe(400);
        });

        it('should return 401 when no token is provided', async () => {
            const response = await request(server)
                .patch(`/api/v1/programs/${programs.course.id}`)
                .send({ title: 'Updated', type: 'Course' });

            expect(response.status).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
            const response = await request(server)
                .patch(`/api/v1/programs/${programs.course.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ title: 'Updated', type: 'Course' });

            expect(response.status).toBe(403);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .patch('/api/v1/programs/99999')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ title: 'Updated', type: 'Course' });

            expect(response.status).toBe(404);
        });

        it('should return 415 for unsupported media type', async () => {
            const response = await request(server)
                .patch(`/api/v1/programs/${programs.course.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .set('Content-Type', 'text/plain')
                .send('title=Updated&type=Course');

            expect(response.status).toBe(415);
        });
    });

    describe('DELETE /api/v1/programs/:programId', () => {
        it('should return 200 and delete a program', async () => {
            const response = await request(server)
                .delete('/api/v1/programs/1')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully deleted a program.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should return 400 when invalid programId', async () => {
            const response = await request(server)
                .delete('/api/v1/programs/abc')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 400,
                    data: null,
                    message: 'Validation error.',
                    errors: [
                        {
                            message: '"value" must be a number',
                            context: {
                                value: 'abc',
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 401 when invalid token', async () => {
            const response = await request(server).delete('/api/v1/programs/1');

            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 401,
                    data: null,
                    message: 'Unauthorized.',
                    errors: [
                        {
                            message: 'Invalid or expired token.',
                            context: {
                                key: 'request.headers.authorization',
                                value: null,
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 403 when accessing with user token', async () => {
            const response = await request(server)
                .delete('/api/v1/programs/1')
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(403);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 403,
                    data: null,
                    message: 'Forbidden.',
                    errors: [
                        {
                            message:
                                'You do not have the necessary permissions to access this resource.',
                            context: {
                                key: 'role',
                                value: 'User',
                            },
                        },
                    ],
                }),
            );
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .delete('/api/v1/programs/404')
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    statusCode: 404,
                    data: null,
                    message: 'Resource not found.',
                    errors: [
                        {
                            message: 'Program with "programId" does not exist',
                            context: {
                                key: 'programId',
                                value: 404,
                            },
                        },
                    ],
                }),
            );
        });
    });

    describe('PUT /api/v1/programs/:programId/thumbnails', () => {
        const testImagePath = path.join(
            __dirname,
            'fixtures',
            'test-image.png',
        );

        it('should return 201 and upload a thumbnail', async () => {
            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('thumbnail', testImagePath);

            expect(response.status).toBe(201);
            expect(response.body.data.thumbnailUrl).toBeDefined();
        }, 10000);

        it('should return 400 when thumbnail is empty', async () => {
            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
        });

        it('should return 400 when there is extra file field', async () => {
            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('thumbnail', testImagePath)
                .attach('extra', testImagePath);

            expect(response.status).toBe(400);
        });

        it('should return 401 when invalid token', async () => {
            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .attach('thumbnail', testImagePath);

            expect(response.status).toBe(401);
        });

        it('should return 403 when accessing with user token', async () => {
            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .put('/api/v1/programs/9999/thumbnails')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('thumbnail', testImagePath);

            expect(response.status).toBe(404);
        });

        it('should return 413 when the file is too large', async () => {
            const largeImagePath = path.join(
                __dirname,
                'fixtures',
                'large-test-image.jpg',
            );

            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('thumbnail', largeImagePath);

            expect(response.status).toBe(413);
        });

        it('should return 415 for unsupported media type', async () => {
            const textFilePath = path.join(
                __dirname,
                'fixtures',
                'test-file.txt',
            );

            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('thumbnail', textFilePath);

            expect(response.status).toBe(415);
        });

        it('should return 415 when file type cannot be determined', async () => {
            const emptyFilePath = path.join(
                __dirname,
                'fixtures',
                'empty-file',
            );

            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('thumbnail', emptyFilePath);

            expect(response.status).toBe(415);
        });

        it('should return 415 for a fake image file', async () => {
            const fakeImagePath = path.join(
                __dirname,
                'fixtures',
                'fake-image.png',
            );

            const response = await request(server)
                .put(`/api/v1/programs/${programs.course.id}/thumbnails`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('thumbnail', fakeImagePath);

            expect(response.status).toBe(415);
        });
    });

    describe('GET /api/v1/programs/:programId/modules', () => {
        it('should return 200 and fetches all module data with default query parameter', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.course.id}/modules`)
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.modules).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
        });

        it('should return 200 and fetches all module data with last page and sort by createdAt in descending order', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/programs/${programs.course.id}/modules?page=2&limit=10&sort=-createdAt`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(200);
            expect(response.body.data.modules).toBeInstanceOf(Array);
        });

        it('should return 200 and fetches empty module data with out of bound page number', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.course.id}/modules?page=100`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(200);
            expect(response.body.data.modules).toBeInstanceOf(Array);
        });

        it('should return 400 when invalid path parameter programId', async () => {
            const response = await request(server)
                .get('/api/v1/programs/abc/modules')
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(400);
        });

        it('should return 400 when invalid query paramater format', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/programs/${programs.course.id}/modules?page=abc&sort=xyz`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(400);
        });

        it('should return 401 when invalid access token', async () => {
            const response = await request(server).get(
                `/api/v1/programs/${programs.course.id}/modules`,
            );
            expect(response.status).toBe(401);
        });

        it('should return 403 when forbidden user access', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.course.id}/modules`)
                .set('Authorization', `Bearer ${tokens.another}`);
            expect(response.status).toBe(403);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .get('/api/v1/programs/9999/modules')
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/v1/programs/:programId/modules/:moduleId', () => {
        let module;

        beforeEach(async () => {
            const course = await Course.findOne({
                where: { programId: programs.course.id },
            });
            module = await CourseModule.findOne({
                where: { courseId: course.id },
            });
        });

        it('should return 200 and fetches module data', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(200);
            expect(response.body.data.module.id).toBe(module.id);
        });

        it('should return 400 when invalid path parameter programId', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/abc/modules/${module.id}`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(400);
        });

        it('should return 400 when invalid path parameter moduleId', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.course.id}/modules/abc`)
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(400);
        });

        it('should return 401 when invalid access token', async () => {
            const response = await request(server).get(
                `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
            );
            expect(response.status).toBe(401);
        });

        it('should return 403 when forbidden user access', async () => {
            const response = await request(server)
                .get(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .set('Authorization', `Bearer ${tokens.another}`);
            expect(response.status).toBe(403);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/9999/modules/${module.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(404);
        });

        it('should return 404 when module does not exist', async () => {
            const response = await request(server)
                .get(`/api/v1/programs/${programs.course.id}/modules/9999`)
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/v1/programs/:programId/modules', () => {
        it('should return 201 and creates a module', async () => {
            const mockModuleData = {
                numberCode: 21,
                youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            };
            const response = await request(server)
                .post(`/api/v1/programs/${programs.course.id}/modules`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(mockModuleData);

            expect(response.status).toBe(201);
            expect(response.body.data.module).toBeDefined();
        });

        it('should return 400 when invalid path parameter programId', async () => {
            const response = await request(server)
                .post('/api/v1/programs/abc/modules')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({
                    numberCode: 1,
                    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 when invalid request body format', async () => {
            const response = await request(server)
                .post(`/api/v1/programs/${programs.course.id}/modules`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ numberCode: 'satu' });
            expect(response.status).toBe(400);
        });

        it('should return 401 when invalid access token', async () => {
            const response = await request(server)
                .post(`/api/v1/programs/${programs.course.id}/modules`)
                .send({
                    numberCode: 1,
                    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                });
            expect(response.status).toBe(401);
        });

        it('should return 403 when forbidden user access', async () => {
            const response = await request(server)
                .post(`/api/v1/programs/${programs.course.id}/modules`)
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({
                    numberCode: 1,
                    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                });
            expect(response.status).toBe(403);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .post('/api/v1/programs/9999/modules')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({
                    numberCode: 1,
                    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                });
            expect(response.status).toBe(404);
        });

        it('should return 415 when invalid content type', async () => {
            const response = await request(server)
                .post(`/api/v1/programs/${programs.course.id}/modules`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .set('Content-Type', 'text/plain')
                .send('numberCode=1&youtubeUrl=https://example.com');
            expect(response.status).toBe(415);
        });
    });

    describe('PATCH /api/v1/programs/:programId/modules/:moduleId', () => {
        let module;

        beforeEach(async () => {
            const course = await Course.findOne({
                where: { programId: programs.course.id },
            });
            module = await CourseModule.findOne({
                where: { courseId: course.id },
            });
        });

        it('should return 200 and update a module', async () => {
            const mockUpdateData = {
                numberCode: 100,
                youtubeUrl: 'https://youtube.com/new-video',
            };
            const response = await request(server)
                .patch(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(mockUpdateData);

            expect(response.status).toBe(200);
            expect(response.body.data.module.numberCode).toBe(
                mockUpdateData.numberCode,
            );
        });

        it('should return 400 when invalid path parameter programId', async () => {
            const response = await request(server)
                .patch(`/api/v1/programs/abc/modules/${module.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ numberCode: 1 });
            expect(response.status).toBe(400);
        });

        it('should return 400 when invalid path parameter moduleId', async () => {
            const response = await request(server)
                .patch(`/api/v1/programs/${programs.course.id}/modules/abc`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ numberCode: 1 });
            expect(response.status).toBe(400);
        });

        it('should return 400 when invalid request body format', async () => {
            const response = await request(server)
                .patch(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ youtubeUrl: 'not-a-url' });
            expect(response.status).toBe(400);
        });

        it('should return 401 when invalid access token', async () => {
            const response = await request(server)
                .patch(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .send({ numberCode: 1 });
            expect(response.status).toBe(401);
        });

        it('should return 403 when forbidden user access', async () => {
            const response = await request(server)
                .patch(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`)
                .send({ numberCode: 1 });
            expect(response.status).toBe(403);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .patch(`/api/v1/programs/9999/modules/${module.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ numberCode: 1 });
            expect(response.status).toBe(404);
        });

        it('should return 404 when module does not exist', async () => {
            const response = await request(server)
                .patch(`/api/v1/programs/${programs.course.id}/modules/9999`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send({ numberCode: 1 });
            expect(response.status).toBe(404);
        });

        it('should return 415 when invalid content type', async () => {
            const response = await request(server)
                .patch(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .set('Content-Type', 'text/plain')
                .send('numberCode=1');
            expect(response.status).toBe(415);
        });
    });

    describe('DELETE /api/v1/programs/:programId/modules/:moduleId', () => {
        let module;

        beforeEach(async () => {
            const course = await Course.findOne({
                where: { programId: programs.course.id },
            });
            module = await CourseModule.findOne({
                where: { courseId: course.id },
            });
        });

        it('should return 200 and delete a module', async () => {
            const response = await request(server)
                .delete(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(
                'Successfully deleted a module.',
            );
        });

        it('should return 400 when invalid path parameter programId', async () => {
            const response = await request(server)
                .delete(`/api/v1/programs/abc/modules/${module.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(400);
        });

        it('should return 400 when invalid path parameter moduleId', async () => {
            const response = await request(server)
                .delete(`/api/v1/programs/${programs.course.id}/modules/abc`)
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(400);
        });

        it('should return 401 when invalid access token', async () => {
            const response = await request(server).delete(
                `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
            );
            expect(response.status).toBe(401);
        });

        it('should return 403 when forbidden user access', async () => {
            const response = await request(server)
                .delete(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);
            expect(response.status).toBe(403);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .delete(`/api/v1/programs/9999/modules/${module.id}`)
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(404);
        });

        it('should return 404 when module does not exist', async () => {
            const response = await request(server)
                .delete(`/api/v1/programs/${programs.course.id}/modules/9999`)
                .set('Authorization', `Bearer ${tokens.admin}`);
            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/v1/programs/:programId/modules/:moduleId/materials', () => {
        let module;
        const testFilePath = path.join(
            __dirname,
            'fixtures',
            'test-document.pdf',
        );
        const testImagePath = path.join(
            __dirname,
            'fixtures',
            'test-image.png',
        );

        beforeEach(async () => {
            const course = await Course.findOne({
                where: { programId: programs.course.id },
            });
            module = await CourseModule.findOne({
                where: { courseId: course.id },
            });
        });

        it('should return 201 and upload a material for a module', async () => {
            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}/materials`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('material', testFilePath);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    success: true,
                    statusCode: 201,
                    message: 'Successfully uploaded a module material.',
                    data: {
                        materialUrl: expect.stringContaining('.pdf'),
                    },
                    errors: null,
                }),
            );
        }, 10000);

        it('should return 201 and replace an existing material', async () => {
            await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}/materials`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('material', testFilePath);

            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}/materials`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('material', testImagePath);

            expect(response.status).toBe(201);
            expect(response.body.data.materialUrl).toContain('.png');
        }, 10000);

        it('should return 400 when programId is invalid', async () => {
            const response = await request(server)
                .put(`/api/v1/programs/abc/modules/${module.id}/materials`)
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
        });

        it('should return 400 when moduleId is invalid', async () => {
            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/abc/materials`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
        });

        it('should return 400 when no file is attached', async () => {
            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}/materials`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`);

            expect(response.status).toBe(400);
        });

        it('should return 401 when no token is provided', async () => {
            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}/materials`,
                )
                .attach('material', testFilePath);

            expect(response.status).toBe(401);
        });

        it('should return 403 when a non-admin user tries to upload', async () => {
            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}/materials`,
                )
                .set('Authorization', `Bearer ${tokens.regular}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 when program does not exist', async () => {
            const response = await request(server)
                .put(`/api/v1/programs/9999/modules/${module.id}/materials`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('material', testFilePath);

            expect(response.status).toBe(404);
        });

        it('should return 404 when module does not exist', async () => {
            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/9999/materials`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('material', testFilePath);

            expect(response.status).toBe(404);
        });

        it('should return 413 when the file is too large (25MB limit)', async () => {
            const largeDocumentPath = path.join(
                __dirname,
                'fixtures',
                'large-test-document.pdf',
            );

            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}/materials`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('material', largeDocumentPath);

            expect(response.status).toBe(413);
        });

        it('should return 415 for an unsupported file type', async () => {
            const unsupportedFilePath = path.join(
                __dirname,
                'fixtures',
                'test-unsupported-file.cpp',
            );

            const response = await request(server)
                .put(
                    `/api/v1/programs/${programs.course.id}/modules/${module.id}/materials`,
                )
                .set('Authorization', `Bearer ${tokens.admin}`)
                .attach('material', unsupportedFilePath);

            expect(response.status).toBe(415);
        });
    });
});
