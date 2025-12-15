const Joi = require('joi');

// Query parameters of GET /api/v1/feedbacks
const feedbackQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|createdAt)$/)
        .default('id'),
    email: Joi.string().email().allow(null).default(null),
    q: Joi.string(),
});

// Request body of POST /api/v1/feedbacks
const feedback = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    message: Joi.string().required(),
});

// Request body of POST /api/v1/feedbacks/:feedbackId/responses
const feedbackResponse = Joi.object({
    message: Joi.string().required(),
});

module.exports = {
    feedbackQueryParam,
    feedback,
    feedbackResponse,
};
