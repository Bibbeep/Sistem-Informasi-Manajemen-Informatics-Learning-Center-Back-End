const Joi = require('joi');

// Query param for GET /api/v1/certificates
const certificateQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|issuedAt|expiredAt|updatedAt)$/)
        .default('id'),
    userId: Joi.number().integer().positive(),
    programId: Joi.number().integer().positive(),
    credential: Joi.string().pattern(/^(CRS|SMN|CMP|WRS)\d{4}-U\d{4}$/),
    type: Joi.string()
        .valid('course', 'seminar', 'workshop', 'competition', 'all')
        .default('all'),
});

const certificatePayload = Joi.object({
    enrollmentId: Joi.number().integer().positive().required(),
    title: Joi.string(),
    issuedAt: Joi.date().iso().min(new Date()).default(new Date()),
    expiredAt: Joi.date().iso().greater(Joi.ref('issuedAt')).optional(),
});

module.exports = {
    certificateQueryParam,
    certificatePayload,
};
