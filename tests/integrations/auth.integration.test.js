/* eslint-disable no-undef */
const request = require('supertest');
const { fakerID_ID: faker } = require('@faker-js/faker');
const { sequelize } = require('../../src/configs/database');
const { server } = require('../../src/server');
const truncate = require('../../scripts/db/truncate');
const userFactory = require('../../src/db/seeders/factories/user');
const User = require('../../src/db/models/user');

describe('Authentication Integration Test', () => {
    afterAll(async () => {
        server.close();
        await sequelize.close();
    });

    beforeEach(async () => {
        //
    });

    afterEach(async () => {
        await truncate();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should return 201 and successfully registered a new user account', async () => {
            const mockData = {
                email: faker.internet.email(),
                password: faker.internet.password({
                    length: faker.number.int({
                        min: 8,
                        max: 72,
                    }),
                }),
                fullName: faker.person.fullName(),
            };

            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(mockData);

            expect(response.status).toBe(201);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(true);
            expect(statusCode).toBe(201);
            expect(message).toBe('Successfully registered a new user account.');
            expect(data).toHaveProperty('user');
            expect(data.user).toEqual({
                id: expect.any(Number),
                email: mockData.email,
                fullName: mockData.fullName,
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
            expect(errors).toBeNull();
        });

        it('should return 400 if invalid request body', async () => {
            const mockData = {
                email: faker.person.fullName(),
                fullName: faker.number.float(),
            };

            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(mockData);

            expect(response.status).toBe(400);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(false);
            expect(statusCode).toBe(400);
            expect(message).toBe('Request body validation error.');
            expect(data).toBeNull();
            expect(errors).toMatchObject([
                {
                    message: '"fullName" must be a string',
                    context: {
                        key: 'fullName',
                        value: mockData.fullName,
                    },
                },
                {
                    message: '"email" must be a valid email',
                    context: {
                        key: 'email',
                        value: mockData.email,
                    },
                },
                {
                    message: '"password" is required',
                    context: {
                        key: 'password',
                    },
                },
            ]);
        });

        it('should return 409 if user already exist', async () => {
            const existingUser = await userFactory();
            const mockData = {
                email: existingUser.email,
                password: existingUser.hashedPassword,
                fullName: existingUser.fullName,
            };

            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(mockData);

            expect(response.status).toBe(409);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(false);
            expect(statusCode).toBe(409);
            expect(message).toBe('Resource conflict.');
            expect(data).toBeNull();
            expect(errors).toMatchObject([
                {
                    message: 'email is already registered.',
                    context: {
                        key: 'email',
                        value: mockData.email,
                    },
                },
            ]);
        });

        it('should return 500 if server encounters an internal error', async () => {
            const mockData = {
                email: faker.internet.email(),
                password: faker.internet.password({
                    length: faker.number.int({
                        min: 8,
                        max: 72,
                    }),
                }),
                fullName: faker.person.fullName(),
            };

            const originalCreate = User.create;
            User.create = jest
                .fn()
                .mockRejectedValue(new Error('Database connection lost'));

            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(mockData);

            User.create = originalCreate;

            expect(response.status).toBe(500);

            const { success, statusCode, message, data, errors } =
                response.body;

            expect(success).toBe(false);
            expect(statusCode).toBe(500);
            expect(message).toBe('There is an issue with the server.');
            expect(data).toBeNull();
            expect(errors).toBeNull();
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should return 200 and successfully signed a JWT access token', async () => {
            //
        });

        it('should return 400 if invalid request body', async () => {
            //
        });

        it('should return 401 if invalid login credentials', async () => {
            //
        });

        it('should return 500 if server encounters an internal error', async () => {
            //
        });
    });
});
