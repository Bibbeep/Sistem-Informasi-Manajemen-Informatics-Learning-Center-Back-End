const DiscussionService = require('../services/discussion.service');
const { validateDiscussionQuery } = require('../validations/validator');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const { error, value } = validateDiscussionQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, discussions } =
                await DiscussionService.getMany(value);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all discussion forums.',
                data: {
                    discussions,
                },
                pagination,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
