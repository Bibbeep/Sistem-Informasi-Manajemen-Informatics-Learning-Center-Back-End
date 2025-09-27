/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
const FeedbackService = require('../../../src/services/feedback.service');
const { Feedback, FeedbackResponse } = require('../../../src/db/models');

describe('Feedback Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMany Tests', () => {
        it('should return feedbacks and pagination data with all default query parameter value', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                email: null,
            };

            const mockCount = 50;
            const mockRows = [
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
            const mockReturnValue = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 50,
                    currentPage: 1,
                    totalPages: 5,
                    nextPage: 2,
                    prevPage: null,
                },
                feedbacks: mockRows,
            };

            Feedback.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const returnValue = await FeedbackService.getMany(mockParams);

            expect(Feedback.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                include: [
                    {
                        model: FeedbackResponse,
                        as: 'responses',
                        attributes: {
                            exclude: ['feedbackId'],
                        },
                    },
                ],
                limit: 10,
                offset: 0,
                order: [['id', 'ASC']],
            });
            expect(returnValue).toStrictEqual(mockReturnValue);
        });

        it('should return feedbacks and pagination data with email filter', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                email: 'johndoe@mail.com',
            };

            const mockCount = 50;
            const mockRows = [
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
            const mockReturnValue = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 50,
                    currentPage: 1,
                    totalPages: 5,
                    nextPage: 2,
                    prevPage: null,
                },
                feedbacks: mockRows,
            };

            Feedback.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const returnValue = await FeedbackService.getMany(mockParams);

            expect(Feedback.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    email: mockParams.email,
                },
                include: [
                    {
                        model: FeedbackResponse,
                        as: 'responses',
                        attributes: {
                            exclude: ['feedbackId'],
                        },
                    },
                ],
                limit: 10,
                offset: 0,
                order: [['id', 'ASC']],
            });
            expect(returnValue).toStrictEqual(mockReturnValue);
        });

        it('should return feedbacks and pagination data with sort by createdAt descending and last page', async () => {
            const mockParams = {
                page: 5,
                limit: 10,
                sort: '-createdAt',
                email: null,
            };

            const mockCount = 50;
            const mockRows = [
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
            const mockReturnValue = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 50,
                    currentPage: 5,
                    totalPages: 5,
                    nextPage: null,
                    prevPage: 4,
                },
                feedbacks: mockRows,
            };

            Feedback.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const returnValue = await FeedbackService.getMany(mockParams);

            expect(Feedback.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                include: [
                    {
                        model: FeedbackResponse,
                        as: 'responses',
                        attributes: {
                            exclude: ['feedbackId'],
                        },
                    },
                ],
                limit: 10,
                offset: 40,
                order: [['createdAt', 'DESC']],
            });
            expect(returnValue).toStrictEqual(mockReturnValue);
        });

        it('should return feedbacks and pagination data with page number out of bound', async () => {
            const mockParams = {
                page: 7,
                limit: 10,
                sort: 'id',
                email: null,
            };

            const mockCount = 50;
            const mockRows = [];
            const mockReturnValue = {
                pagination: {
                    currentRecords: 0,
                    totalRecords: 50,
                    currentPage: 7,
                    totalPages: 5,
                    nextPage: null,
                    prevPage: null,
                },
                feedbacks: mockRows,
            };

            Feedback.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const returnValue = await FeedbackService.getMany(mockParams);

            expect(Feedback.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                include: [
                    {
                        model: FeedbackResponse,
                        as: 'responses',
                        attributes: {
                            exclude: ['feedbackId'],
                        },
                    },
                ],
                limit: 10,
                offset: 60,
                order: [['id', 'ASC']],
            });
            expect(returnValue).toStrictEqual(mockReturnValue);
        });
    });
});
