const InvoiceService = require('../services/invoice.service');
const { validateInvoiceQuery } = require('../validations/validator');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const { error, value } = validateInvoiceQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, invoices } =
                await InvoiceService.getMany(value);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all invoices.',
                data: {
                    invoices,
                },
                pagination,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            const invoice = await InvoiceService.getOne(
                parseInt(req.params.invoiceId, 10),
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved an invoice details.',
                data: {
                    invoice,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    deleteById: async (req, res, next) => {
        try {
            await InvoiceService.deleteOne(parseInt(req.params.invoiceId, 10));

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted an invoice.',
                data: null,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    createPayment: async (req, res, next) => {
        try {
            const payment = await InvoiceService.createPayment(
                parseInt(req.params.invoiceId, 10),
            );

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully created a payment.',
                data: {
                    payment,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
