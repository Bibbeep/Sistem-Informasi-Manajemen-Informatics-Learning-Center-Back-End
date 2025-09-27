const {
    validateFeedbackQuery,
    validateFeedback,
    validateFeedbackResponse,
} = require('../validations/validator');
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
    create: async (req, res, next) => {
        try {
            const { error, value } = validateFeedback(req.body);

            if (error) {
                throw error;
            }

            const feedback = await FeedbackService.create(value);

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully created a feedback.',
                data: {
                    feedback,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    createResponse: async (req, res, next) => {
        try {
            const { error, value } = validateFeedbackResponse(req.body);

            if (error) {
                throw error;
            }

            const feedbackResponse = await FeedbackService.createResponse({
                feedbackId: parseInt(req.params.feedbackId, 10),
                message: value.message,
                adminUserId: parseInt(req.tokenPayload.sub, 10),
            });

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully created a feedback response.',
                data: {
                    feedbackResponse,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
