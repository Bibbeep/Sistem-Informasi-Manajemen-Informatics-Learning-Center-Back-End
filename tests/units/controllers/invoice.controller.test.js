/* eslint-disable no-undef */
jest.mock('../../../src/services/invoice.service');
jest.mock('../../../src/validations/validator');

const InvoiceController = require('../../../src/controllers/invoice.controller');
const InvoiceService = require('../../../src/services/invoice.service');
const { validateInvoiceQuery } = require('../../../src/validations/validator');
const { ValidationError } = require('joi');
const HTTPError = require('../../../src/utils/httpError');

describe('Invoice Controller Unit Tests', () => {
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
        it('should return 200 with invoices and pagination on success', async () => {
            const mockValue = { page: 1, limit: 10 };
            const mockResponse = {
                pagination: { totalPages: 1 },
                invoices: [{ id: 1 }],
            };
            validateInvoiceQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            InvoiceService.getMany.mockResolvedValue(mockResponse);

            await InvoiceController.getAll(req, res, next);

            expect(validateInvoiceQuery).toHaveBeenCalledWith(req.query);
            expect(InvoiceService.getMany).toHaveBeenCalledWith(mockValue);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all invoices.',
                data: {
                    invoices: mockResponse.invoices,
                },
                pagination: mockResponse.pagination,
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if validation fails', async () => {
            const validationError = new ValidationError('Validation failed');
            validateInvoiceQuery.mockReturnValue({ error: validationError });

            await InvoiceController.getAll(req, res, next);

            expect(validateInvoiceQuery).toHaveBeenCalledWith(req.query);
            expect(InvoiceService.getMany).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(validationError);
        });

        it('should call next with error if service throws an error', async () => {
            const mockValue = { page: 1, limit: 10 };
            const serviceError = new Error('Service error');
            validateInvoiceQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            InvoiceService.getMany.mockRejectedValue(serviceError);

            await InvoiceController.getAll(req, res, next);

            expect(validateInvoiceQuery).toHaveBeenCalledWith(req.query);
            expect(InvoiceService.getMany).toHaveBeenCalledWith(mockValue);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('getById', () => {
        it('should return 200 with a single invoice on success', async () => {
            req.params.invoiceId = '1';
            const mockInvoice = { id: 1 };
            InvoiceService.getOne.mockResolvedValue(mockInvoice);

            await InvoiceController.getById(req, res, next);

            expect(InvoiceService.getOne).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved an invoice details.',
                data: {
                    invoice: mockInvoice,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if service throws an error', async () => {
            req.params.invoiceId = '999';
            const serviceError = new HTTPError(404, 'Not Found');
            InvoiceService.getOne.mockRejectedValue(serviceError);

            await InvoiceController.getById(req, res, next);

            expect(InvoiceService.getOne).toHaveBeenCalledWith(999);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('deleteById', () => {
        it('should return 200 and not throw error', async () => {
            req.params = { invoiceId: '1' };
            InvoiceService.deleteOne.mockResolvedValue();

            await InvoiceController.deleteById(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully deleted an invoice.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should forwards service error to next', async () => {
            req.params = { invoiceId: '404' };
            const mockError = new Error('BOOM');
            InvoiceService.deleteOne.mockRejectedValue(mockError);

            await InvoiceController.deleteById(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('createPayment', () => {
        it('should return 201 and not throw error', async () => {
            req.params = { invoiceId: 1 };
            const mockPayment = {
                id: 1,
            };
            InvoiceService.createPayment.mockResolvedValue(mockPayment);

            await InvoiceController.createPayment(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 201,
                    message: 'Successfully created a payment.',
                    data: {
                        payment: mockPayment,
                    },
                    errors: null,
                }),
            );
        });

        it('should forwards service error to next', async () => {
            req.params = { invoiceId: 1 };
            const mockError = new Error('BOOM');
            InvoiceService.createPayment.mockRejectedValue(mockError);

            await InvoiceController.createPayment(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
