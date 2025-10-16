const Joi = require('joi');

// Query parameters for GET /api/v1/discussions
const discussionQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|createdAt|updatedAt)$/)
        .default('id'),
    title: Joi.string(),
});

// Request body for POST /api/v1/discussions
const discussionPayload = Joi.object({
    title: Joi.string().required(),
}).unknown(false);

// Request body for PATCH /api/v1/discussions/:discussionId
const discussionUpdate = Joi.object({
    title: Joi.string().required(),
}).unknown(false);

module.exports = {
    discussionQueryParam,
    discussionPayload,
    discussionUpdate,
};
