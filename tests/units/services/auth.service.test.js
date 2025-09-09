/* eslint-disable no-undef */
const { fakerID_ID: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const AuthService = require('../../../src/services/auth.service');
const User = require('../../../src/db/models/user');
const HTTPError = require('../../../src/utils/httpError');

jest.mock('bcrypt');
jest.mock('../../../src/db/models/user');

describe('Authentication Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register Tests', () => {
        it('should create a new user and return user data', async () => {
            const mockUserData = {
                email: faker.internet.email(),
                password: faker.internet.password({
                    length: faker.number.int({ min: 8, max: 72 }),
                }),
                fullName: faker.person.fullName(),
            };

            const mockDate = faker.date.recent();
            const mockReturnData = {
                id: 1,
                email: mockUserData.email,
                fullName: mockUserData.fullName,
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            const hashedPassword = 'hashed password';

            User.findOne.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue(hashedPassword);
            User.create.mockResolvedValue({
                id: mockReturnData.id,
                email: mockReturnData.email,
                fullName: mockReturnData.fullName,
                hashedPassword: hashedPassword,
                memberLevel: mockReturnData.memberLevel,
                role: mockReturnData.role,
                pictureUrl: mockReturnData.pictureUrl,
                createdAt: mockReturnData.createdAt,
                updatedAt: mockReturnData.updatedAt,
            });

            const result = await AuthService.register(mockUserData);

            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: mockUserData.email },
            });
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith(
                mockUserData.password,
                'salt',
            );
            expect(User.create).toHaveBeenCalledWith({
                email: mockUserData.email,
                hashedPassword,
                fullName: mockUserData.fullName,
                memberLevel: mockReturnData.memberLevel,
                role: mockReturnData.role,
            });
            expect(result).toEqual({ user: mockReturnData });
        });

        it('should throw error if user already exists', async () => {
            const mockData = {
                email: faker.internet.email(),
                password: faker.internet.password({
                    length: faker.number.int({ min: 8, max: 72 }),
                }),
                fullName: faker.person.fullName(),
            };

            const mockDate = faker.date.recent();
            const mockUserData = {
                id: 1,
                email: mockData.email,
                fullName: mockData.fullName,
                memberLevel: 'Basic',
                role: 'User',
                pictureUrl: null,
                createdAt: mockDate,
                updatedAt: mockDate,
            };

            User.findOne.mockResolvedValue({
                id: mockUserData.id,
                email: mockUserData.email,
                fullName: mockUserData.fullName,
                hashedPassword: 'hashed password',
                memberLevel: mockUserData.memberLevel,
                role: mockUserData.role,
                pictureUrl: mockUserData.pictureUrl,
                createdAt: mockUserData.createdAt,
                updatedAt: mockUserData.updatedAt,
            });

            await expect(AuthService.register(mockData)).rejects.toThrow(
                new HTTPError(409, 'Resource conflict.', [
                    {
                        message: 'email is already registered.',
                        context: {
                            key: 'email',
                            value: mockUserData.email,
                        },
                    },
                ]),
            );

            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: mockData.email },
            });
        });
    });

    describe('login Tests', () => {
        it('should sign an access token and return it', async () => {
            //
        });

        it('should throw error if user with given email does not exist', async () => {
            //
        });

        it('should throw error if given password is incorrect', async () => {
            //
        });
    });
});
