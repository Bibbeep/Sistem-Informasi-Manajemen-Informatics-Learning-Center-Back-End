const {
    register,
    login,
    tokenPayload,
    forgotPassword,
    resetPassword,
} = require('./schemas/auth');

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
};
