const { validateFeedbackQuery } = require('../validations/validator');
const FeedbackService = require('../services/feedback.service');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const { error, value } = validateFeedbackQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, feedbacks } =
                await FeedbackService.getMany(value);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all feedbacks.',
                data: {
                    feedbacks,
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
            const feedback = await FeedbackService.getOne(
                parseInt(req.params.feedbackId, 10),
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved a feedback details.',
                data: {
                    feedback,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
