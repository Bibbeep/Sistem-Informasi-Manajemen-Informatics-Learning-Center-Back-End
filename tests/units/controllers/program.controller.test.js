/* eslint-disable no-undef */
jest.mock('../../../src/validations/validator');
jest.mock('../../../src/services/program.service');
const {
    getAll,
    getById,
    create,
} = require('../../../src/controllers/program.controller');
const {
    validateProgramQuery,
    validateProgram,
} = require('../../../src/validations/validator');
const ProgramService = require('../../../src/services/program.service');
const HTTPError = require('../../../src/utils/httpError');
const { ValidationError } = require('joi');

describe('Program Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            tokenPayload: {},
            params: {},
            query: {},
            body: {},
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

    describe('getById Tests', () => {
        it('should send 200 on success and return program details', async () => {
            req.params = { programId: '1' };
            const mockProgramData = {
                id: 1,
                title: 'Test Program',
                type: 'Course',
                details: {
                    totalModules: 5,
                },
            };

            ProgramService.getOne.mockResolvedValue(mockProgramData);

            await getById(req, res, next);

            expect(ProgramService.getOne).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved a program details.',
                data: {
                    program: mockProgramData,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should forward service errors to the next middleware', async () => {
            req.params = { programId: '999' };
            const serviceError = new HTTPError(404, 'Not Found');
            ProgramService.getOne.mockRejectedValue(serviceError);

            await getById(req, res, next);

            expect(ProgramService.getOne).toHaveBeenCalledWith(999);
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('create Tests', () => {
        it('should create a new program and return 201', async () => {
            const mockProgramData = {
                title: 'New Program',
                description: 'A new program',
                availableDate: new Date().toISOString(),
                type: 'Course',
                priceIdr: 100000,
            };
            req.body = mockProgramData;
            const mockCreatedProgram = {
                id: 1,
                ...mockProgramData,
            };

            validateProgram.mockReturnValue({
                error: null,
                value: mockProgramData,
            });
            ProgramService.create.mockResolvedValue(mockCreatedProgram);

            await create(req, res, next);

            expect(validateProgram).toHaveBeenCalledWith(mockProgramData);
            expect(ProgramService.create).toHaveBeenCalledWith(mockProgramData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'Successfully created a program.',
                data: {
                    program: mockCreatedProgram,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error', async () => {
            const mockInvalidData = {
                title: 'New Program',
            };
            req.body = mockInvalidData;
            const validationError = new ValidationError();
            validateProgram.mockReturnValue({ error: validationError });

            await create(req, res, next);

            expect(validateProgram).toHaveBeenCalledWith(mockInvalidData);
            expect(next).toHaveBeenCalledWith(validationError);
            expect(ProgramService.create).not.toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should forward service errors to the next middleware', async () => {
            const mockProgramData = {
                title: 'New Program',
                description: 'A new program',
                availableDate: new Date().toISOString(),
                type: 'Course',
                priceIdr: 100000,
            };
            req.body = mockProgramData;
            const serviceError = new Error('Service Error');
            validateProgram.mockReturnValue({
                error: null,
                value: mockProgramData,
            });
            ProgramService.create.mockRejectedValue(serviceError);

            await create(req, res, next);

            expect(ProgramService.create).toHaveBeenCalledWith(mockProgramData);
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
