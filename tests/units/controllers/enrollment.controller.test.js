/* eslint-disable no-undef */
jest.mock('../../../src/validations/validator');
jest.mock('../../../src/services/enrollment.service');
const {
    getAll,
    getById,
    create,
    
} = require('../../../src/controllers/enrollment.controller');
const EnrollmentService = require('../../../src/services/enrollment.service');
const {
    validateEnrollmentQuery,
    validateEnrollment,
} = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('Enrollment Controller Unit Tests', () => {
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
            req.query = {
                userId: '1',
            };
            const mockValue = {
                userId: 1,
            };
            const mockPagination = {
                currentRecords: 10,
                totalRecords: 100,
                currentPage: 1,
                totalPages: 10,
                nextPage: 2,
                prevPage: null,
            };
            const mockEnrollments = [
                {
                    id: 1,
                },
                {
                    id: 1,
                },
                {
                    id: 1,
                },
                {
                    id: 1,
                },
                {
                    id: 1,
                },
                {
                    id: 1,
                },
                {
                    id: 1,
                },
                {
                    id: 1,
                },
                {
                    id: 1,
                },
                {
                    id: 1,
                },
            ];
            validateEnrollmentQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            EnrollmentService.getMany.mockResolvedValue({
                pagination: mockPagination,
                enrollments: mockEnrollments,
            });

            await getAll(req, res, next);

            expect(validateEnrollmentQuery).toHaveBeenCalledWith(req.query);
            expect(EnrollmentService.getMany).toHaveBeenCalledWith(mockValue);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all program enrollments.',
                    data: {
                        enrollments: mockEnrollments,
                    },
                    pagination: mockPagination,
                    errors: null,
                }),
            );
        });

        it('should call next with a validation error', async () => {
            req.query = {
                userId: '1',
            };
            const mockError = new ValidationError();
            validateEnrollmentQuery.mockReturnValue({
                error: mockError,
            });

            await getAll(req, res, next);

            expect(validateEnrollmentQuery).toHaveBeenCalledWith(req.query);
            expect(EnrollmentService.getMany).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should forwards service errors to next', async () => {
            req.query = {
                userId: '1',
            };
            const mockValue = {
                userId: 1,
            };
            const mockError = new Error();
            validateEnrollmentQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            EnrollmentService.getMany.mockRejectedValue(mockError);

            await getAll(req, res, next);

            expect(validateEnrollmentQuery).toHaveBeenCalledWith(req.query);
            expect(EnrollmentService.getMany).toHaveBeenCalledWith(mockValue);
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getById Tests', () => {
        it('should sends 200 on success and does not call next', async () => {
            req.params = { enrollmentId: '1' };
            const mockEnrollment = {
                id: 1,
            };
            EnrollmentService.getOne.mockResolvedValue(mockEnrollment);

            await getById(req, res, next);

            expect(EnrollmentService.getOne).toHaveBeenCalledWith(1);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved program enrollment details.',
                data: {
                    enrollment: mockEnrollment,
                },
                errors: null,
            });
        });

        it('should forwards service errors to next', async () => {
            req.params = { enrollmentId: '1' };
            const mockError = new Error('BOOM');
            EnrollmentService.getOne.mockRejectedValue(mockError);

            await getById(req, res, next);

            expect(EnrollmentService.getOne).toHaveBeenCalledWith(1);
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('create Tests', () => {
        it('should sends 201 on success and does not call next', async () => {
            req.body = {
                programId: 1,
            };
            req.tokenPayload = { sub: 1 };
            const mockValue = req.body;
            const mockEnrollment = {
                id: 1,
            };
            const mockInvoice = {
                id: 1,
            };
            validateEnrollment.mockReturnValue({
                error: null,
                value: mockValue,
            });
            EnrollmentService.create.mockResolvedValue({
                enrollment: mockEnrollment,
                invoice: mockInvoice,
            });

            await create(req, res, next);

            expect(validateEnrollment).toHaveBeenCalledWith(req.body);
            expect(EnrollmentService.create).toHaveBeenCalledWith({
                ...mockValue,
                userId: 1,
            });
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 201,
                    message:
                        'Successfully created an enrollment. Please complete the payment to access the contents.',
                    data: {
                        enrollment: mockEnrollment,
                        invoice: mockInvoice,
                    },
                    errors: null,
                }),
            );
        });

        it('should call next with a validation errort', async () => {
            req.body = {
                programId: 'abc',
            };
            const mockError = new ValidationError();
            validateEnrollment.mockReturnValue({
                error: mockError,
            });

            await create(req, res, next);

            expect(validateEnrollment).toHaveBeenCalledWith(req.body);
            expect(EnrollmentService.create).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should sends 201 on success and does not call next', async () => {
            req.body = {
                programId: 1,
            };
            req.tokenPayload = { sub: 1 };
            const mockValue = req.body;
            const mockError = new Error('Error');
            validateEnrollment.mockReturnValue({
                error: null,
                value: mockValue,
            });
            EnrollmentService.create.mockRejectedValue(mockError);

            await create(req, res, next);

            expect(validateEnrollment).toHaveBeenCalledWith(req.body);
            expect(EnrollmentService.create).toHaveBeenCalledWith({
                ...mockValue,
                userId: 1,
            });
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
