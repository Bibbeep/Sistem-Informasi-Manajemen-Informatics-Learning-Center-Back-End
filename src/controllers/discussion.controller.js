const DiscussionService = require('../services/discussion.service');
const {
    validateDiscussionQuery,
    validateDiscussion,
    validateUpdateDiscussionData,
    validateCommentQuery,
    validateCommentByIdQuery,
    validateComment,
    validateUpdateCommentData,
} = require('../validations/validator');

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
    getById: async (req, res, next) => {
        try {
            const discussion = await DiscussionService.getOne(
                parseInt(req.params.discussionId, 10),
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved discussion forum details.',
                data: {
                    discussion,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    create: async (req, res, next) => {
        try {
            const { error, value } = validateDiscussion(req.body);

            if (error) {
                throw error;
            }

            const discussion = await DiscussionService.create({
                ...value,
                adminUserId: parseInt(req.tokenPayload.sub),
            });

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully created a discussion forum.',
                data: {
                    discussion,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    updateById: async (req, res, next) => {
        try {
            const { error, value } = validateUpdateDiscussionData(req.body);

            if (error) {
                throw error;
            }

            const discussion = await DiscussionService.updateOne({
                ...value,
                discussionId: parseInt(req.params.discussionId, 10),
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully updated a discussion forum.',
                data: {
                    discussion,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    deleteById: async (req, res, next) => {
        try {
            await DiscussionService.deleteOne(
                parseInt(req.params.discussionId, 10),
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted a discussion forum.',
                data: null,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    getAllComments: async (req, res, next) => {
        try {
            const { error, value } = validateCommentQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, comments } =
                await DiscussionService.getManyComments({
                    discussionId: parseInt(req.params.discussionId, 10),
                    ...value,
                });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all comments.',
                data: {
                    comments,
                },
                pagination,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    getCommentById: async (req, res, next) => {
        try {
            const { error, value } = validateCommentByIdQuery(req.query);

            if (error) {
                throw error;
            }

            const comment = await DiscussionService.getOneComment({
                discussionId: parseInt(req.params.discussionId, 10),
                commentId: parseInt(req.params.commentId, 10),
                ...value,
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved a comment details.',
                data: {
                    comment,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    createComment: async (req, res, next) => {
        try {
            const { error, value } = validateComment(req.body);

            if (error) {
                throw error;
            }

            const comment = await DiscussionService.createComment({
                ...value,
                discussionId: parseInt(req.params.discussionId, 10),
                userId: parseInt(req.tokenPayload.sub),
            });

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully created a comment.',
                data: {
                    comment,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    updateCommentById: async (req, res, next) => {
        try {
            const { error, value } = validateUpdateCommentData(req.body);

            if (error) {
                throw error;
            }

            const comment = await DiscussionService.updateOneComment({
                discussionId: parseInt(req.params.discussionId, 10),
                commentId: parseInt(req.params.commentId, 10),
                ...value,
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully updated a comment.',
                data: {
                    comment,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    deleteCommentById: async (req, res, next) => {
        try {
            await DiscussionService.deleteOneComment({
                discussionId: parseInt(req.params.discussionId, 10),
                commentId: parseInt(req.params.commentId, 10),
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted a discussion forum.',
                data: null,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
