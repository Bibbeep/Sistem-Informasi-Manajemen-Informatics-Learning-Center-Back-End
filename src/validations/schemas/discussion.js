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
    mainContent: Joi.string().required(),
}).unknown(false);

// Request body for PATCH /api/v1/discussions/:discussionId
const discussionUpdate = Joi.object({
    title: Joi.string(),
    mainContent: Joi.string(),
})
    .min(1)
    .unknown(false);

// Query parameters for GET /api/v1/discussions/:discussionId/comments
const commentQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|likesCount|repliesCount|createdAt|updatedAt)$/)
        .default('id'),
    parentCommentId: Joi.when(Joi.ref('.'), {
        is: Joi.number().integer().valid(0),
        then: Joi.custom(() => {
            return null;
        }),
        otherwise: Joi.number().integer().positive(),
    }),
});

// Query parameters for GET /api/v1/discussions/:discussionId/comments/:commentId
const commentByIdQueryParam = Joi.object({
    includeReplies: Joi.bool().default(false),
});

// Request body for POST /api/v1/discussions/:discussionId/comments
const commentPayload = Joi.object({
    parentCommentId: Joi.number().integer().positive().allow(null).required(),
    message: Joi.string().required(),
}).unknown(false);

// Request body for PATCH /api/v1/discussions/:discussionId/comments/:discussionId
const commentUpdate = Joi.object({
    message: Joi.string(),
})
    .min(1)
    .unknown(false);

module.exports = {
    discussionQueryParam,
    discussionPayload,
    discussionUpdate,
    commentQueryParam,
    commentByIdQueryParam,
    commentPayload,
    commentUpdate,
};
