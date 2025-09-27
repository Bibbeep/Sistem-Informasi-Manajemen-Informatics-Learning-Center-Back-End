/* eslint-disable no-undef */
jest.mock('../../../src/services/feedback.service');
jest.mock('../../../src/validations/validator');
const {
    getAll,
    getById,
} = require('../../../src/controllers/feedback.controller');
const FeedbackService = require('../../../src/services/feedback.service');
const HTTPError = require('../../../src/utils/httpError');
const { validateFeedbackQuery } = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('Feedback Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            tokenPayload: {},
            params: {},
            query: {},
        };

        res = {
            status: jest.fn().mockReturnThis?.() || { json: jest.fn() },
            json: jest.fn(),
        };

        res.status = jest.fn(() => {
            return res;
        });

        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll Tests', () => {
        it('should sends 200 on success and does not call next', async () => {
            req.query = {
                page: 1,
                limit: 10,
                sort: 'id',
                email: null,
            };

            const mockPagination = {
                currentRecords: 10,
                totalRecords: 50,
                currentPage: 1,
                totalPages: 5,
                nextPage: 2,
                prevPage: null,
            };

            const mockFeedbacks = [
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
                {
                    dummy: 'feedback',
                },
            ];

            validateFeedbackQuery.mockReturnValue({
                error: null,
                value: req.query,
            });
            FeedbackService.getMany.mockResolvedValue({
                pagination: mockPagination,
                feedbacks: mockFeedbacks,
            });

            await getAll(req, res, next);

            expect(validateFeedbackQuery).toHaveBeenCalledWith(req.query);
            expect(FeedbackService.getMany).toHaveBeenCalledWith(req.query);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all feedbacks.',
                    data: {
                        feedbacks: mockFeedbacks,
                    },
                    pagination: mockPagination,
                    errors: null,
                }),
            );
        });

        it('should calls next with Joi.ValidationError when validation fails', async () => {
            req.query = {
                page: 'abc',
                limit: 10,
                sort: 'id',
                email: null,
            };

            const mockError = new ValidationError();
            validateFeedbackQuery.mockReturnValue({ error: mockError });

            await getAll(req, res, next);

            expect(validateFeedbackQuery).toHaveBeenCalledWith(req.query);
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getById Tests', () => {
        it('should sends 200 on success and does not call next', async () => {
            req.params = { feedbackId: '1' };
            const mockFeedback = {
                id: 1,
                email: 'Salsabila.Nasyiah@yahoo.co.id',
                fullName: 'Zalindra Lestari',
                message: 'Contigo possimus dignissimos tamdiu.',
                createdAt: '2025-03-12T03:13:10.990Z',
                updatedAt: '2025-07-19T16:11:02.483Z',
                responses: [
                    {
                        id: 1,
                        adminUserId: 2,
                        message:
                            'Considero tenus acidus acquiro demitto illo corporis degero. Optio tumultus vulgaris valde creptio vilicus fuga tertius ubi.',
                        createdAt: '2025-03-20T20:45:47.619Z',
                        updatedAt: '2025-05-18T11:04:15.275Z',
                    },
                ],
            };

            FeedbackService.getOne.mockResolvedValue(mockFeedback);

            await getById(req, res, next);

            expect(FeedbackService.getOne).toHaveBeenCalledWith(
                parseInt(req.params.feedbackId, 10),
            );
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved a feedback details.',
                    data: {
                        feedback: mockFeedback,
                    },
                    errors: null,
                }),
            );
        });

        it('should sends 404 error thrown from service and call next', async () => {
            req.params = { feedbackId: '404' };
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Feedback with "feedbackId" does not exist',
                    context: {
                        key: 'feedbackId',
                        value: parseInt(req.params.feedbackId, 10),
                    },
                },
            ]);

            FeedbackService.getOne.mockRejectedValue(mockError);

            await getById(req, res, next);

            expect(FeedbackService.getOne).toHaveBeenCalledWith(
                parseInt(req.params.feedbackId, 10),
            );
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
