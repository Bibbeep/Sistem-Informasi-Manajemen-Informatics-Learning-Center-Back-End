/* eslint-disable no-undef */
jest.mock('../../../src/services/feedback.service');
jest.mock('../../../src/validations/validator');
const { getAll } = require('../../../src/controllers/feedback.controller');
const FeedbackService = require('../../../src/services/feedback.service');
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
});
