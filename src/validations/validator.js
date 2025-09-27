const Joi = require('joi');
const {
    register,
    login,
    tokenPayload,
    forgotPassword,
    resetPassword,
} = require('./schemas/auth');
const { userQueryParam, userUpdate } = require('./schemas/user');
const { feedbackQueryParam } = require('./schemas/feedback');

// Any auto-increment integer id
const uniqueIdentifier = Joi.number().integer().positive().required();

const validator = (schema) => {
    return (payload) => {
        return schema.validate(payload, { abortEarly: false });
    };
};

module.exports = {
    validateRegister: validator(register),
    validateLogin: validator(login),
    validateTokenPayload: validator(tokenPayload),
    validateForgotPassword: validator(forgotPassword),
    validateResetPassword: validator(resetPassword),
    validateUserQuery: validator(userQueryParam),
    validateId: validator(uniqueIdentifier),
    validateUpdateUserData: validator(userUpdate),
    validateFeedbackQuery: validator(feedbackQueryParam),
};
