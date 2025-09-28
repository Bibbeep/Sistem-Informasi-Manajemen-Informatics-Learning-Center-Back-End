const Joi = require('joi');

const programQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|createdAt|price|availableDate)$/)
        .custom((value) => {
            if (value.includes('price')) {
                return value + 'Idr';
            }

            return value;
        })
        .default('id'),
    type: Joi.string()
        .valid('course', 'seminar', 'workshop', 'competition', 'all')
        .default('all'),
    'price.gte': Joi.number().integer().min(0).default(0),
    'price.lte': Joi.number().integer().positive(),
});

module.exports = {
    programQueryParam,
};
