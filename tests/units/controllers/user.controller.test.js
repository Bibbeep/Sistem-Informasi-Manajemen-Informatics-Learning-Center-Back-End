/* eslint-disable no-undef */
jest.mock('../../../src/services/user.service');
jest.mock('../../../src/validations/validator');
const { getAll } = require('../../../src/controllers/user.controller');
const UserService = require('../../../src/services/user.service');
const { validateUserQuery } = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('User Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis?.() || { json: jest.fn() },
            json: jest.fn(),
        };

        res.status = jest.fn(() => {
            return res;
        });

        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll Tests', () => {
        it('should sends 200 on success and does not call next', async () => {
            req.query = {
                page: 1,
                limit: 10,
                sort: 'id',
                role: 'all',
                level: 'all',
            };
            const mockValue = req.query;
            const mockPagination = {
                currentRecords: 10,
                totalRecords: 40,
                currentPage: 1,
                totalPages: 4,
                nextPage: 2,
                prevPage: null,
            };
            const mockUsers = [
                { user: 'mock-user' },
                { user: 'mock-user' },
                { user: 'mock-user' },
                { user: 'mock-user' },
                { user: 'mock-user' },
                { user: 'mock-user' },
                { user: 'mock-user' },
                { user: 'mock-user' },
                { user: 'mock-user' },
                { user: 'mock-user' },
            ];

            validateUserQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            UserService.getMany.mockResolvedValue({
                pagination: mockPagination,
                users: mockUsers,
            });

            await getAll(req, res, next);

            expect(validateUserQuery).toHaveBeenCalledWith(mockValue);
            expect(UserService.getMany).toHaveBeenCalledWith(mockValue);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all user data.',
                    data: {
                        users: mockUsers,
                    },
                    pagination: mockPagination,
                    errors: null,
                }),
            );
        });

        it('should calls next with Joi.ValidationError when validation fails', async () => {
            req.query = {
                page: 'mock-fail',
                limit: 10,
                sort: 'id',
                role: 'all',
                level: 'all',
            };
            const mockValidationError = new ValidationError();
            validateUserQuery.mockReturnValue({ error: mockValidationError });

            await getAll(req, res, next);

            expect(validateUserQuery).toHaveBeenCalledWith(req.query);
            expect(next).toHaveBeenCalledWith(mockValidationError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should forwards service errors to next', async () => {
            req.query = {
                page: 1,
                limit: 10,
                sort: 'id',
                role: 'all',
                level: 'all',
            };
            const mockValue = req.query;
            const serviceError = new Error('BOOM');
            validateUserQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            UserService.getMany.mockRejectedValue(serviceError);

            await getAll(req, res, next);

            expect(validateUserQuery).toHaveBeenCalledWith(req.query);
            expect(UserService.getMany).toHaveBeenCalledWith(mockValue);
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
