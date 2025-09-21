const {
    validateUserQuery,
    validateId,
    validateUpdateUserData,
} = require('../validations/validator');
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
            const user = await UserService.getOne(
                parseInt(req.params.userId, 10),
            );

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
    updateById: async (req, res, next) => {
        try {
            const { error, value } = validateUpdateUserData(req.body);

            if (error) {
                throw error;
            }

            const user = await UserService.updateOne({
                userId: parseInt(req.params.userId, 10),
                ...value,
            });

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
