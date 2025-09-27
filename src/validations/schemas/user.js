const Joi = require('joi');

// Query parameters of GET /api/v1/users
const userQueryParam = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(10),
    sort: Joi.string()
        .regex(/^-?(id|fullName|createdAt)$/)
        .default('id'),
    role: Joi.string().valid('user', 'admin', 'all').default('all'),
    level: Joi.string().valid('basic', 'premium', 'all').default('all'),
});

// Request body of PATCH /api/v1/users/:userId
const userUpdate = Joi.object({
    fullName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).max(72).optional(),
})
    .min(1)
    .unknown(false);

module.exports = {
    userQueryParam,
    userUpdate,
};
