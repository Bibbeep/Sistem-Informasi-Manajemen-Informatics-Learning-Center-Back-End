const Joi = require('joi');

// Query param for GET /api/v1/invoices
const invoiceQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|paymentDue|createdAt|updatedAt)$/)
        .custom((value) => {
            if (value.includes('progress')) {
                return value + 'Percentage';
            } else if (value.includes('paymentDue')) {
                return value + 'Datetime';
            }

            return value;
        })
        .default('id'),
    userId: Joi.number().integer().positive(),
    status: Joi.string()
        .valid('verified', 'unverified', 'expired', 'all')
        .default('all'),
    type: Joi.string()
        .valid('course', 'seminar', 'workshop', 'competition', 'all')
        .default('all'),
});

module.exports = {
    invoiceQueryParam,
};
