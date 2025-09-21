const { validateUserQuery, validateId } = require('../validations/validator');
const UserService = require('../services/user.service');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const { error, value } = validateUserQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, users } = await UserService.getMany(value);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all user data.',
                data: {
                    users,
                },
                pagination,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            const { error, value } = validateId(req.params.userId);

            if (error) {
                throw error;
            }

            const user = await UserService.getOne(value);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved user data.',
                data: {
                    user,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
