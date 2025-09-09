const Joi = require('joi');

// Request body of POST /api/v1/auth/register
const register = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(72).required(),
});

// Request body of POST /api/v1/auth/login
const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(72).required(),
});

module.exports = {
    register,
    login,
};
