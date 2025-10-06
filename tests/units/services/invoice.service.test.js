/* eslint-disable no-undef */
jest.mock('../../../src/db/models');

const {
    Invoice,
    Enrollment,
    Program,
    sequelize,
    Payment,
} = require('../../../src/db/models');
const InvoiceService = require('../../../src/services/invoice.service');
const HTTPError = require('../../../src/utils/httpError');

describe('Invoice Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMany', () => {
        it('should return invoices with default parameters', async () => {
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                status: 'all',
                type: 'all',
            };
            const mockInvoices = {
                count: 1,
                rows: [
                    {
                        id: 1,
                        enrollment: {
                            userId: 1,
                            programId: 1,
                            program: {
                                title: 'Test Program',
                                type: 'Course',
                                thumbnailUrl: 'url',
                            },
                        },
                        payment: {
                            id: 1,
                            amountPaidIdr: 100000,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        virtualAccountNumber: '123',
                        amountIdr: 100000,
                        paymentDueDatetime: new Date(),
                        status: 'Verified',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                    },
                ],
            };
            Invoice.findAndCountAll.mockResolvedValue(mockInvoices);

            const result = await InvoiceService.getMany(data);

            expect(Invoice.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                    order: [['id', 'ASC']],
                }),
            );
            expect(result.invoices.length).toBe(1);
            expect(result.pagination.totalRecords).toBe(1);
        });

        it('should handle filters for status, type, and userId', async () => {
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                status: 'verified',
                type: 'course',
                userId: 1,
            };
            Invoice.findAndCountAll.mockResolvedValue({
                count: 100,
                rows: new Array(10).fill({
                    enrollment: { program: {} },
                    payment: {},
                }),
            });

            await InvoiceService.getMany(data);

            expect(Invoice.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'Verified' },
                    include: expect.arrayContaining([
                        expect.objectContaining({
                            model: Enrollment,
                            where: { userId: 1 },
                            include: expect.arrayContaining([
                                expect.objectContaining({
                                    model: Program,
                                    where: { type: 'Course' },
                                }),
                            ]),
                        }),
                    ]),
                }),
            );
        });

        it('should handle descending sort', async () => {
            const data = {
                page: 1,
                limit: 10,
                sort: '-createdAt',
                status: 'all',
                type: 'all',
            };
            Invoice.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

            await InvoiceService.getMany(data);

            expect(Invoice.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: [['createdAt', 'DESC']],
                }),
            );
        });

        it('should correctly calculate pagination for the last page', async () => {
            const data = {
                page: 2,
                limit: 10,
                sort: 'id',
                status: 'all',
                type: 'all',
            };
            Invoice.findAndCountAll.mockResolvedValue({
                count: 15,
                rows: new Array(5).fill({
                    enrollment: { program: {} },
                    payment: {},
                }),
            });

            const result = await InvoiceService.getMany(data);

            expect(result.pagination).toEqual({
                currentRecords: 5,
                totalRecords: 15,
                currentPage: 2,
                totalPages: 2,
                nextPage: null,
                prevPage: 1,
            });
        });

        it('should handle out-of-bounds page number', async () => {
            const data = {
                page: 100,
                limit: 10,
                sort: 'id',
                status: 'all',
                type: 'all',
            };
            Invoice.findAndCountAll.mockResolvedValue({ count: 15, rows: [] });

            const result = await InvoiceService.getMany(data);

            expect(result.invoices.length).toBe(0);
            expect(result.pagination.currentPage).toBe(100);
            expect(result.pagination.prevPage).toBe(null);
        });

        it('should handle last page number', async () => {
            const data = {
                page: 2,
                limit: 10,
                sort: 'id',
                status: 'all',
                type: 'all',
            };
            Invoice.findAndCountAll.mockResolvedValue({
                count: 15,
                rows: new Array(10).fill({
                    enrollment: { program: {} },
                    payment: {},
                }),
            });

            const result = await InvoiceService.getMany(data);

            expect(result.invoices.length).toBe(10);
            expect(result.pagination.currentPage).toBe(2);
            expect(result.pagination.prevPage).toBe(1);
            expect(result.pagination.nextPage).toBe(null);
        });

        it('should handle invoices with null payment or enrollment', async () => {
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                status: 'all',
                type: 'all',
            };
            const mockInvoices = {
                count: 2,
                rows: [
                    { id: 1, enrollment: null, payment: null },
                    {
                        id: 2,
                        enrollment: { program: {} },
                        payment: null,
                    },
                ],
            };
            Invoice.findAndCountAll.mockResolvedValue(mockInvoices);

            const result = await InvoiceService.getMany(data);

            expect(result.invoices[0].userId).toBeUndefined();
            expect(result.invoices[0].payment).toBeNull();
            expect(result.invoices[1].payment).toBeNull();
        });
    });

    describe('getOne', () => {
        it('should return a single invoice with all details', async () => {
            const invoiceId = 1;
            const mockInvoice = {
                id: 1,
                enrollment: {
                    userId: 1,
                    programId: 1,
                    program: {
                        title: 'Test Program',
                        type: 'Course',
                        thumbnailUrl: 'url',
                    },
                },
                payment: {
                    id: 1,
                    amountPaidIdr: 100000,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };
            Invoice.findByPk.mockResolvedValue(mockInvoice);

            const result = await InvoiceService.getOne(invoiceId);

            expect(Invoice.findByPk).toHaveBeenCalledWith(
                invoiceId,
                expect.any(Object),
            );
            expect(result.id).toBe(invoiceId);
            expect(result.payment).toBeDefined();
        });

        it('should return an invoice with null payment and enrollment details', async () => {
            const invoiceId = 1;
            const mockInvoice = {
                id: 1,
                enrollment: null,
                payment: null,
            };
            Invoice.findByPk.mockResolvedValue(mockInvoice);

            const result = await InvoiceService.getOne(invoiceId);

            expect(result.payment).toBeNull();
            expect(result.userId).toBeUndefined();
        });

        it('should throw HTTPError if invoice not found', async () => {
            const invoiceId = 999;
            Invoice.findByPk.mockResolvedValue(null);

            await expect(InvoiceService.getOne(invoiceId)).rejects.toThrow(
                HTTPError,
            );
        });
    });

    describe('getOwnerId', () => {
        it('should return userId', async () => {
            const mockInvoiceId = 1;
            const mockInvoice = {
                id: 1,
                enrollment: {
                    id: 1,
                    userId: 1,
                },
            };
            Invoice.findByPk.mockResolvedValue(mockInvoice);

            const result = await InvoiceService.getOwnerId(mockInvoiceId);

            expect(result).toBe(mockInvoice.enrollment.userId);
        });

        it('should return null when invoice does not exist', async () => {
            const mockInvoiceId = 404;
            Invoice.findByPk.mockResolvedValue(null);

            const result = await InvoiceService.getOwnerId(mockInvoiceId);

            expect(result).toBe(null);
        });
    });

    describe('deleteOne', () => {
        it('should delete an invoice', async () => {
            const mockInvoiceId = 1;
            const mockInvoice = {
                id: 1,
            };
            Invoice.findByPk.mockResolvedValue(mockInvoice);
            Invoice.destroy.mockResolvedValue();

            await InvoiceService.deleteOne(mockInvoiceId);

            expect(Invoice.findByPk).toHaveBeenCalledWith(mockInvoiceId);
            expect(Invoice.destroy).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: mockInvoiceId } }),
            );
        });

        it('should throw 404 error if invoice does not exist', async () => {
            const mockInvoiceId = 404;
            Invoice.findByPk.mockResolvedValue(null);
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Invoice with "invoiceId" does not exist',
                    context: {
                        key: 'invoiceId',
                        value: mockInvoiceId,
                    },
                },
            ]);

            await expect(
                InvoiceService.deleteOne(mockInvoiceId),
            ).rejects.toThrow(mockError);

            expect(Invoice.findByPk).toHaveBeenCalledWith(mockInvoiceId);
            expect(Invoice.destroy).not.toHaveBeenCalled();
        });
    });

    describe('createPayment', () => {
        it('should create a payment', async () => {
            const mockInvoiceId = 1;
            const mockInvoice = {
                id: 1,
                status: 'Unverified',
                amountIdr: 1000_000,
                enrollmentId: 1,
            };
            const mockPayment = {
                id: 1,
            };
            Invoice.findByPk.mockResolvedValue(mockInvoice);
            Payment.create.mockResolvedValue(mockPayment);
            Invoice.update.mockResolvedValue();
            Enrollment.update.mockResolvedValue();
            sequelize.transaction.mockImplementation(async (callback) => {
                return callback();
            });

            const result = await InvoiceService.createPayment(mockInvoiceId);

            expect(result).toEqual(expect.objectContaining(mockPayment));
        });

        it('should throw 404 error when invoice does not exist', async () => {
            const mockInvoiceId = 404;
            Invoice.findByPk.mockResolvedValue(null);
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Invoice with "invoiceId" does not exist',
                    context: {
                        key: 'invoiceId',
                        value: mockInvoiceId,
                    },
                },
            ]);

            await expect(
                InvoiceService.createPayment(mockInvoiceId),
            ).rejects.toThrow(mockError);
        });

        it('should throw 400 error when invoice is expired', async () => {
            const mockInvoiceId = 1;
            const mockInvoice = {
                id: 1,
                status: 'Expired',
                amountIdr: 1000_000,
                enrollmentId: 1,
            };
            const mockError = new HTTPError(400, 'Validation error.', [
                {
                    message: 'Invoice with "invoiceId" is expired',
                    context: {
                        key: 'invoiceId',
                        value: mockInvoiceId,
                    },
                },
            ]);
            Invoice.findByPk.mockResolvedValue(mockInvoice);

            await expect(
                InvoiceService.createPayment(mockInvoiceId),
            ).rejects.toThrow(mockError);
        });

        it('should throw 409 error when payment is already made', async () => {
            const mockInvoiceId = 1;
            const mockInvoice = {
                id: 1,
                status: 'Verified',
                amountIdr: 1000_000,
                enrollmentId: 1,
            };
            const mockError = new HTTPError(409, 'Resource conflict.', [
                {
                    message: 'Payment has already been made for this invoice',
                    context: {
                        key: 'invoiceId',
                        value: mockInvoiceId,
                    },
                },
            ]);
            Invoice.findByPk.mockResolvedValue(mockInvoice);

            await expect(
                InvoiceService.createPayment(mockInvoiceId),
            ).rejects.toThrow(mockError);
        });
    });
});
