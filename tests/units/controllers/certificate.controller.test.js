/* eslint-disable no-undef */
jest.mock('../../../src/services/certificate.service');
jest.mock('../../../src/validations/validator');

const CertificateController = require('../../../src/controllers/certificate.controller');
const CertificateService = require('../../../src/services/certificate.service');
const {
    validateCertificateQuery,
} = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('Certificate Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { query: {}, params: {} };
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
});
