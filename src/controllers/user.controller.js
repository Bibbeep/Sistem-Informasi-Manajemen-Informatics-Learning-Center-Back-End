const { validateUserQuery } = require('../validations/validator');
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
};
