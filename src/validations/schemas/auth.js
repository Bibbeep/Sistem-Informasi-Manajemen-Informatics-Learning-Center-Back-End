/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const Joi = require('joi');

// Request body of POST /api/v1/auth/register
const register = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
        )
        .message(
            '"password" must includes uppercase and lowercase letters, numbers, and symbols',
        )
        .min(12)
        .max(72)
        .required(),
});

// Request body of POST /api/v1/auth/login
const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// JWT access token payload
const tokenPayload = Joi.object({
    sub: Joi.number().integer().positive().required(),
    admin: Joi.boolean().required(),
    iat: Joi.date().timestamp('unix').required(),
    exp: Joi.date().timestamp('unix').required(),
    jti: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .required(),
    aud: Joi.string()
        .allow(process.env.CORS_ORIGIN)
        .uri({ scheme: ['http', 'https'] })
        .required(),
    iss: Joi.string()
        .uri({ scheme: ['http', 'https'] })
        .required(),
}).unknown(false);

// Password reset request
const forgotPassword = Joi.object({
    email: Joi.string().email().required(),
});

// Password reset
const resetPassword = Joi.object({
    userId: Joi.number().integer().positive().required(),
    token: Joi.string().hex().length(64).required(),
    newPassword: Joi.string()
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
        )
        .message(
            '"newPassword" must includes uppercase and lowercase letters, numbers, and symbols',
        )
        .min(12)
        .max(72)
        .required(),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

module.exports = {
    register,
    login,
    tokenPayload,
    forgotPassword,
    resetPassword,
};
