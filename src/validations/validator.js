const Joi = require('joi');
const {
    register,
    login,
    tokenPayload,
    forgotPassword,
    resetPassword,
} = require('./schemas/auth');
const { userQueryParam, userUpdate } = require('./schemas/user');
const {
    feedbackQueryParam,
    feedback,
    feedbackResponse,
} = require('./schemas/feedback');
const {
    programQueryParam,
    program,
    programUpdate,
    moduleQueryParam,
    modulePayload,
    moduleUpdate,
} = require('./schemas/program');
const {
    enrollmentQueryParam,
    enrollmentPayload,
    enrollmentUpdate,
    completedModulePayload,
} = require('./schemas/enrollment');
const { invoiceQueryParam } = require('./schemas/invoice');
const {
    certificateQueryParam,
    certificatePayload,
    certificateUpdate,
} = require('./schemas/certificate');

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
    validateFeedback: validator(feedback),
    validateFeedbackResponse: validator(feedbackResponse),
    validateProgramQuery: validator(programQueryParam),
    validateProgram: validator(program),
    validateUpdateProgramData: validator(programUpdate),
    validateModuleQuery: validator(moduleQueryParam),
    validateModule: validator(modulePayload),
    validateUpdateModuleData: validator(moduleUpdate),
    validateEnrollmentQuery: validator(enrollmentQueryParam),
    validateEnrollment: validator(enrollmentPayload),
    validateUpdateEnrollmentData: validator(enrollmentUpdate),
    validateCompleteModule: validator(completedModulePayload),
    validateInvoiceQuery: validator(invoiceQueryParam),
    validateCertificateQuery: validator(certificateQueryParam),
    validateCertificate: validator(certificatePayload),
    validateUpdateCertificateData: validator(certificateUpdate),
};
