/* eslint-disable no-undef */
jest.mock('../../../src/services/invoice.service');
jest.mock('../../../src/validations/validator');

const InvoiceController = require('../../../src/controllers/invoice.controller');
const InvoiceService = require('../../../src/services/invoice.service');
const { validateInvoiceQuery } = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('Invoice Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { query: {} };
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
});
