const { Discussion, Comment } = require('../db/models');
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
        // const { page, limit, sort } = data;
        // let groupAndOrder = {
        //     order: sort.startsWith('-')
        //         ? [[sort.replace('-', ''), 'DESC']]
        //         : [[sort, 'ASC']],
        // };
        // if (['likesCount'].includes(sort)) {
        //     groupAndOrder.group = {
        //     };
        // }
        // const { count, rows } = await Comment.findAndCountAll({
        //     where: {
        //         parentCommentId: null,
        //     },
        //     limit,
        //     offset: (page - 1) * limit,
        //     ...groupAndOrder,
        // });
        //
    }
}

module.exports = DiscussionService;
