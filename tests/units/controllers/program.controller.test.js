/* eslint-disable no-undef */
jest.mock('../../../src/validations/validator');
jest.mock('../../../src/services/program.service');
const { getAll } = require('../../../src/controllers/program.controller');
const { validateProgramQuery } = require('../../../src/validations/validator');
const ProgramService = require('../../../src/services/program.service');
const { ValidationError } = require('joi');

describe('Program Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            tokenPayload: {},
            params: {},
            query: {},
        };

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
            const mockValue = {
                limit: 10,
                page: 1,
                sort: 'id',
                type: 'all',
                'price.gte': 0,
            };

            const mockPagination = {
                currentRecords: 10,
                totalRecords: 100,
                currentPage: 1,
                totalPages: 10,
                nextPage: 2,
                prevPage: null,
            };

            const mockPrograms = [
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
            ];

            validateProgramQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            ProgramService.getMany.mockResolvedValue({
                pagination: mockPagination,
                programs: mockPrograms,
            });

            await getAll(req, res, next);

            expect(validateProgramQuery).toHaveBeenCalledWith(req.query);
            expect(ProgramService.getMany).toHaveBeenCalledWith(mockValue);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all programs.',
                    data: {
                        programs: expect.any(Array),
                    },
                    pagination: mockPagination,
                    errors: null,
                }),
            );
        });

        it('should calls next with Joi.ValidationError when validation fails', async () => {
            req.query = {
                limit: 'abc',
                page: true,
                sort: '+updatedAt',
                type: 'BackEnd',
                'price.gte': -100,
            };

            const mockError = new ValidationError();
            validateProgramQuery.mockReturnValue({ error: mockError });

            await getAll(req, res, next);

            expect(validateProgramQuery).toHaveBeenCalledWith(req.query);
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
