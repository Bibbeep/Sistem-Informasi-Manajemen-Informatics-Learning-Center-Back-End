const { validateRegister } = require('../validations/validator');
const AuthService = require('../services/auth.service');

module.exports = {
    register: async (req, res, next) => {
        try {
            const { error, value } = validateRegister(req.body);

            if (error) {
                throw error;
            }

            const data = await AuthService.register(value);

            return res.status(201).json({
                success: true,
                statusCode: 201,
                data,
                message: '',
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
