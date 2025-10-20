const { Discussion, Comment, User, Like, sequelize } = require('../db/models');
const HTTPError = require('../utils/httpError');

class DiscussionService {
    static async getMany(data) {
        const { page, limit, sort } = data;
        const where = {};

        if (data.title) {
            where.title = data.title;
        }

        const { count, rows } = await Discussion.findAndCountAll({
            where,
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
        });

        if (rows.length) {
            rows.forEach((discussion, index) => {
                rows[index] = {
                    id: discussion.id,
                    title: discussion.title,
                    createdAt: discussion.createdAt,
                    updatedAt: discussion.updatedAt,
                };
            });
        }

        const totalPages = Math.ceil(count / limit);

        return {
            pagination: {
                currentRecords: rows.length,
                totalRecords: count,
                currentPage: page,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage:
                    page > totalPages + 1 ? null : page > 1 ? page - 1 : null,
            },
            discussions: rows,
        };
    }

    static async getOne(discussionId) {
        const discussion = await Discussion.findByPk(discussionId);

        if (!discussion) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        return {
            id: discussion.id,
            title: discussion.title,
            createdAt: discussion.createdAt,
            updatedAt: discussion.updatedAt,
        };
    }

    static async create(data) {
        const discussion = await Discussion.create(data);

        return {
            id: discussion.id,
            title: discussion.title,
            createdAt: discussion.createdAt,
            updatedAt: discussion.updatedAt,
        };
    }

    static async updateOne(data) {
        const { discussionId, title } = data;

        const discussion = await Discussion.findByPk(discussionId);

        if (!discussion) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        // eslint-disable-next-line no-unused-vars
        const [count, rows] = await Discussion.update(
            {
                title,
            },
            {
                where: {
                    id: discussionId,
                },
                returning: true,
            },
        );

        return {
            id: rows[0].id,
            title: rows[0].title,
            createdAt: rows[0].createdAt,
            updatedAt: rows[0].updatedAt,
        };
    }

    static async deleteOne(discussionId) {
        const discussion = await Discussion.findByPk(discussionId);

        if (!discussion) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        await Discussion.destroy({ where: { id: discussionId } });
    }

    static async getManyComments(data) {
        const { page, limit, sort, discussionId } = data;
        const discussion = await Discussion.findByPk(discussionId);

        if (!discussion) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        let where = {
            discussionId,
        };

        if (data.parentCommentId !== undefined) {
            where.parentCommentId = data.parentCommentId;
        }

        const { count, rows } = await Comment.findAndCountAll({
            where,
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM comment_likes AS l
                            WHERE l.comment_id = "Comment".id
                        )`),
                        'likesCount',
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM comments AS r 
                            WHERE r.parent_comment_id = "Comment".id
                        )`),
                        'repliesCount',
                    ],
                ],
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName'],
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
        });

        if (rows.length) {
            rows.forEach((comment, index) => {
                rows[index] = {
                    id: comment.id,
                    userId: comment.userId,
                    fullName: comment.user?.fullName || null,
                    parentCommentId: comment.parentCommentId,
                    message: comment.message,
                    likesCount: Number(comment.getDataValue('likesCount')) || 0,
                    repliesCount:
                        Number(comment.getDataValue('repliesCount')) || 0,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                };
            });
        }

        const totalPages = Math.ceil(count / limit);

        return {
            pagination: {
                currentRecords: rows.length,
                totalRecords: count,
                currentPage: page,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage:
                    page > totalPages + 1 ? null : page > 1 ? page - 1 : null,
            },
            comments: rows,
        };
    }

    static async getOneComment(data) {
        const { discussionId, commentId, includeReplies } = data;
        const discussion = await Discussion.findByPk(discussionId);

        if (!discussion) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        let options = {
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM comment_likes AS l
                            WHERE l.comment_id = "Comment".id
                        )`),
                        'likesCount',
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM comments AS r 
                            WHERE r.parent_comment_id = "Comment".id
                        )`),
                        'repliesCount',
                    ],
                ],
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName'],
                    required: false,
                },
            ],
        };

        if (includeReplies) {
            options.include = [
                {
                    model: Comment,
                    as: 'replies',
                    required: false,
                    attributes: {
                        include: [
                            [
                                sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM comment_likes AS l
                            WHERE l.comment_id = replies.id
                        )`),
                                'likesCount',
                            ],
                            [
                                sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM comments AS r 
                            WHERE r.parent_comment_id = replies.id
                        )`),
                                'repliesCount',
                            ],
                        ],
                    },
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'fullName'],
                            required: false,
                        },
                    ],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName'],
                    required: false,
                },
            ];
        }

        const comment = await Comment.findOne({
            where: {
                discussionId,
                id: commentId,
            },
            ...options,
        });

        if (!comment) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Comment with "commentId" does not exist',
                    context: {
                        key: 'commentId',
                        value: commentId,
                    },
                },
            ]);
        }

        if (comment.replies?.length) {
            comment.replies.forEach((reply, index) => {
                comment.replies[index] = {
                    id: reply.id,
                    userId: reply.userId,
                    fullName: reply.user?.fullName || null,
                    message: reply.message,
                    likesCount: Number(reply.getDataValue('likesCount')) || 0,
                    repliesCount:
                        Number(reply.getDataValue('repliesCount')) || 0,
                    createdAt: reply.createdAt,
                    updatedAt: reply.updatedAt,
                    deletedAt: reply.deletedAt,
                };
            });
        }

        const result = {
            id: comment.id,
            userId: comment.userId,
            fullName: comment.user?.fullName || null,
            parentCommentId: comment.parentCommentId,
            message: comment.message,
            likesCount: Number(comment.getDataValue('likesCount')) || 0,
            repliesCount: Number(comment.getDataValue('repliesCount')) || 0,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            deletedAt: comment.deletedAt,
        };

        if (comment.replies) {
            result.replies = comment.replies;
        }

        return result;
    }

    static async createComment(data) {
        const { discussionId, parentCommentId, userId, message } = data;
        const discussion = await Discussion.findByPk(discussionId);

        if (!discussion) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        if (
            parentCommentId &&
            !(await Comment.findOne({
                where: {
                    id: parentCommentId,
                    discussionId,
                },
            }))
        ) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Comment with "parentCommentId" does not exist',
                    context: {
                        key: 'parentCommentId',
                        value: parentCommentId,
                    },
                },
            ]);
        }

        const comment = await Comment.create({
            discussionId,
            parentCommentId,
            userId,
            message,
        });

        return comment;
    }

    static async updateOneComment(data) {
        const { discussionId, commentId, message } = data;

        if (!(await Discussion.findByPk(discussionId))) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        if (
            !(await Comment.findOne({
                where: {
                    id: commentId,
                    discussionId,
                },
            }))
        ) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Comment with "commentId" does not exist',
                    context: {
                        key: 'commentId',
                        value: commentId,
                    },
                },
            ]);
        }

        // eslint-disable-next-line no-unused-vars
        const [count, rows] = await Comment.update(
            {
                message,
            },
            {
                where: {
                    discussionId,
                    id: commentId,
                },
                returning: true,
            },
        );

        return rows[0].toJSON();
    }

    static async deleteOneComment(data) {
        const { discussionId, commentId } = data;

        if (!(await Discussion.findByPk(discussionId))) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        if (
            !(await Comment.findOne({
                where: {
                    id: commentId,
                    discussionId,
                },
            }))
        ) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Comment with "commentId" does not exist',
                    context: {
                        key: 'commentId',
                        value: commentId,
                    },
                },
            ]);
        }

        await Comment.destroy({
            where: {
                id: commentId,
            },
        });
    }

    static async createLike(data) {
        const { discussionId, commentId, userId } = data;

        if (!(await Discussion.findByPk(discussionId))) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Discussion with "discussionId" does not exist',
                    context: {
                        key: 'discussionId',
                        value: discussionId,
                    },
                },
            ]);
        }

        if (
            !(await Comment.findOne({
                where: {
                    id: commentId,
                    discussionId,
                },
            }))
        ) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Comment with "commentId" does not exist',
                    context: {
                        key: 'commentId',
                        value: commentId,
                    },
                },
            ]);
        }

        if (
            await Like.findOne({
                where: {
                    commentId,
                    userId,
                },
            })
        ) {
            throw new HTTPError(409, 'Resource conflict.', [
                {
                    message: 'Comment with "commentId" has already been liked.',
                    context: {
                        key: 'commmentId',
                        value: commentId,
                    },
                },
            ]);
        }

        await Like.create({
            commentId,
            userId,
        });

        const comment = await Comment.findOne({
            where: {
                id: commentId,
                discussionId,
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM comment_likes AS l
                            WHERE l.comment_id = "Comment".id
                        )`),
                        'likesCount',
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM comments AS r 
                            WHERE r.parent_comment_id = "Comment".id
                        )`),
                        'repliesCount',
                    ],
                ],
            },
        });

        return Number(comment.getDataValue('likesCount')) || 0;
    }
}

module.exports = DiscussionService;
