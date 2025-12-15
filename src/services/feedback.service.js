const { Op, fn } = require('sequelize');
const { Feedback, FeedbackResponse } = require('../db/models');
const HTTPError = require('../utils/httpError');
const mailer = require('../utils/mailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class FeedbackService {
    static async getMany(data) {
        const { page, limit, sort, email } = data;
        const where = {};

        if (email) {
            where.email = email;
        }

        if (data.q) {
            where._search = {
                [Op.match]: fn('plainto_tsquery', 'english', data.q),
            };
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

    static async getOne(feedbackId) {
        const feedback = await Feedback.findByPk(feedbackId, {
            include: [
                {
                    model: FeedbackResponse,
                    as: 'responses',
                    attributes: {
                        exclude: ['feedbackId'],
                    },
                },
            ],
        });

        if (!feedback) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Feedback with "feedbackId" does not exist',
                    context: {
                        key: 'feedbackId',
                        value: feedbackId,
                    },
                },
            ]);
        }

        return feedback;
    }

    static async create(data) {
        const { fullName, email, message } = data;

        const feedback = await Feedback.create({
            fullName,
            email,
            message,
        });

        return feedback;
    }

    static async createResponse(data) {
        const { feedbackId, message, adminUserId } = data;

        const isFeedbackExist = await Feedback.findByPk(feedbackId);

        if (!isFeedbackExist) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Feedback with "feedbackId" does not exist',
                    context: {
                        key: 'feedbackId',
                        value: feedbackId,
                    },
                },
            ]);
        }

        const templateSource = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'templates',
                'emails',
                'feedback-response.hbs',
            ),
            'utf8',
        );

        const template = handlebars.compile(templateSource);
        const html = template({
            fullName: isFeedbackExist.fullName,
            responseMessage: message,
        });

        await mailer(
            isFeedbackExist.email,
            'Your Feedback has a new Response - Informatics Learning Center',
            `Hi ${isFeedbackExist.fullName},\n\nAn admin has responded to your feedback:\n\n${message}\n\nThank you for your contribution!`,
            html,
        );

        const feedbackResponse = await FeedbackResponse.create({
            feedbackId,
            message,
            adminUserId,
        });

        return feedbackResponse;
    }
}

module.exports = FeedbackService;
