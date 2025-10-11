/* eslint-disable no-undef */
jest.mock('../../../src/services/certificate.service');
jest.mock('../../../src/validations/validator');

const CertificateController = require('../../../src/controllers/certificate.controller');
const CertificateService = require('../../../src/services/certificate.service');
const {
    validateCertificateQuery,
    validateCertificate,
    validateUpdateCertificateData,
} = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('Certificate Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { query: {}, params: {}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should call res with 200', async () => {
            const mockValue = {
                page: 1,
                limit: 10,
                sort: 'id',
                type: 'all',
            };
            const mockPagination = {
                currentRecords: 10,
            };
            const mockCertificates = new Array(10);

            validateCertificateQuery.mockReturnValue({ value: mockValue });
            CertificateService.getMany.mockResolvedValue({
                pagination: mockPagination,
                certificates: mockCertificates,
            });

            await CertificateController.getAll(req, res, next);

            expect(validateCertificateQuery).toHaveBeenCalledWith(req.query);
            expect(CertificateService.getMany).toHaveBeenCalledWith(mockValue);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all certificates.',
                    data: {
                        certificates: expect.any(Array),
                    },
                    pagination: expect.any(Object),
                    errors: null,
                }),
            );
        });

        it('should call next with Joi error', async () => {
            const mockError = new ValidationError();
            validateCertificateQuery.mockReturnValue({ error: mockError });

            await CertificateController.getAll(req, res, next);

            expect(validateCertificateQuery).toHaveBeenCalledWith(req.query);
            expect(CertificateService.getMany).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should call res with 200', async () => {
            req.params = { certificateId: '1' };
            const mockCertificate = {
                id: 1,
                title: 'title',
            };
            CertificateService.getOne.mockResolvedValue(mockCertificate);

            await CertificateController.getById(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved a certificate.',
                    data: {
                        certificate: mockCertificate,
                    },
                    errors: null,
                }),
            );
        });

        it('should call next with service error', async () => {
            req.params = { certificateId: '1' };
            const mockServiceError = new Error('BOOM!');
            CertificateService.getOne.mockRejectedValue(mockServiceError);

            await CertificateController.getById(req, res, next);

            expect(next).toHaveBeenCalledWith(mockServiceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should return 201 and the created certificate', async () => {
            const mockRequestBody = { enrollmentId: 1 };
            const mockCertificate = { id: 1, title: 'Test Certificate' };
            validateCertificate.mockReturnValue({
                error: null,
                value: mockRequestBody,
            });
            CertificateService.create.mockResolvedValue(mockCertificate);

            await CertificateController.create(req, res, next);

            expect(validateCertificate).toHaveBeenCalledWith(req.body);
            expect(CertificateService.create).toHaveBeenCalledWith(
                mockRequestBody,
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'Successfully created a certificate.',
                data: {
                    certificate: mockCertificate,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error', async () => {
            const validationError = new ValidationError('Validation failed');
            validateCertificate.mockReturnValue({ error: validationError });

            await CertificateController.create(req, res, next);

            expect(validateCertificate).toHaveBeenCalledWith(req.body);
            expect(CertificateService.create).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should forward service errors to next', async () => {
            const mockRequestBody = { enrollmentId: 1 };
            const serviceError = new Error('Service error');
            validateCertificate.mockReturnValue({
                error: null,
                value: mockRequestBody,
            });
            CertificateService.create.mockRejectedValue(serviceError);

            await CertificateController.create(req, res, next);

            expect(CertificateService.create).toHaveBeenCalledWith(
                mockRequestBody,
            );
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('updateById', () => {
        it('should return 200 and the updated certificate on success', async () => {
            req.params.certificateId = '1';
            const mockUpdateData = { title: 'New Title' };
            const mockUpdatedCertificate = { id: 1, title: 'New Title' };

            validateUpdateCertificateData.mockReturnValue({
                error: null,
                value: mockUpdateData,
            });
            CertificateService.updateOne.mockResolvedValue(
                mockUpdatedCertificate,
            );

            await CertificateController.updateById(req, res, next);

            expect(validateUpdateCertificateData).toHaveBeenCalledWith(
                req.body,
            );
            expect(CertificateService.updateOne).toHaveBeenCalledWith({
                certificateId: 1,
                updateData: mockUpdateData,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully updated a certificate.',
                data: {
                    certificate: mockUpdatedCertificate,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error if request body is invalid', async () => {
            req.params.certificateId = '1';
            const validationError = new ValidationError('Validation failed');
            validateUpdateCertificateData.mockReturnValue({
                error: validationError,
            });

            await CertificateController.updateById(req, res, next);

            expect(validateUpdateCertificateData).toHaveBeenCalledWith(
                req.body,
            );
            expect(CertificateService.updateOne).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should forward service errors to the next middleware', async () => {
            req.params.certificateId = '1';
            const mockUpdateData = { title: 'New Title' };
            const serviceError = new Error('Service error');

            validateUpdateCertificateData.mockReturnValue({
                error: null,
                value: mockUpdateData,
            });
            CertificateService.updateOne.mockRejectedValue(serviceError);

            await CertificateController.updateById(req, res, next);

            expect(CertificateService.updateOne).toHaveBeenCalledWith({
                certificateId: 1,
                updateData: mockUpdateData,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });
});
