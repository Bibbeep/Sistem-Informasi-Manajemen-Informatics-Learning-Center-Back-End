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
};
