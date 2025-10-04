const Joi = require('joi');

// Query param for GET /api/v1/enrollments
const enrollmentQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|progress|createdAt|updatedAt|completedAt)$/)
        .custom((value) => {
            if (value.includes('progress')) {
                return value + 'Percentage';
            }

            return value;
        })
        .default('id'),
    userId: Joi.number().integer().positive(),
    programId: Joi.number().integer().positive(),
    programType: Joi.string()
        .valid('course', 'seminar', 'workshop', 'competition', 'all')
        .default('all'),
    status: Joi.string()
        .valid('unpaid', 'in progress', 'completed', 'all')
        .default('all'),
});

const enrollmentPayload = Joi.object({
    programId: Joi.number().integer().positive().required(),
}).unknown(false);

module.exports = {
    enrollmentQueryParam,
    enrollmentPayload,
};
