const { Feedback, FeedbackResponse } = require('../db/models');

class FeedbackService {
    static async getMany(data) {
        const { page, limit, sort, email } = data;
        const where = {};

        if (email) {
            where.email = email;
        }

        const { count, rows } = await Feedback.findAndCountAll({
            where,
            include: [
                {
                    model: FeedbackResponse,
                    as: 'responses',
                    attributes: {
                        exclude: ['feedbackId'],
                    },
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
        });

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
            feedbacks: rows,
        };
    }
}

module.exports = FeedbackService;
