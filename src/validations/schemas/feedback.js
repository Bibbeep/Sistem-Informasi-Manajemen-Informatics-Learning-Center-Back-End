const Joi = require('joi');

// Query parameters of GET /api/v1/feedbacks
const feedbackQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|createdAt)$/)
        .default('id'),
    email: Joi.string().email().allow(null).default(null),
});

module.exports = {
    feedbackQueryParam,
};
