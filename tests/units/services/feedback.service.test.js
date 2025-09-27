/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
const FeedbackService = require('../../../src/services/feedback.service');
const { Feedback, FeedbackResponse } = require('../../../src/db/models');
const HTTPError = require('../../../src/utils/httpError');

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

    describe('getOne Tests', () => {
        it('should return feedback data', async () => {
            const mockFeedbackId = 1;
            const mockFeedbackData = {
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

            Feedback.findByPk.mockResolvedValue(mockFeedbackData);

            const returnValue = await FeedbackService.getOne(mockFeedbackId);

            expect(Feedback.findByPk).toHaveBeenCalledWith(mockFeedbackId, {
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
            expect(returnValue).toStrictEqual(mockFeedbackData);
        });

        it('should throw 404 error when feedback does not exist', async () => {
            const mockFeedbackId = 404;

            Feedback.findByPk.mockResolvedValue(null);

            await expect(
                FeedbackService.getOne(mockFeedbackId),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Feedback with "feedbackId" does not exist',
                        context: {
                            key: 'feedbackId',
                            value: mockFeedbackId,
                        },
                    },
                ]),
            );
            expect(Feedback.findByPk).toHaveBeenCalledWith(mockFeedbackId, {
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
        });
    });

    describe('create Tests', () => {
        it('should create a new feedback', async () => {
            const mockData = {
                fullName: 'John Doe',
                email: 'johndoe@mail.com',
                message: 'It would be helpful if you guys can add quizzes :)',
            };
            const mockReturnData = {
                id: 1,
                fullName: 'John Doe',
                email: 'johndoe@mail.com',
                message: 'It would be helpful if you guys can add quizzes :)',
                updatedAt: '2025-09-27T14:12:22.993Z',
                createdAt: '2025-09-27T14:12:22.993Z',
            };

            Feedback.create.mockResolvedValue(mockReturnData);

            const returnValue = await FeedbackService.create(mockData);

            expect(Feedback.create).toHaveBeenCalledWith({ ...mockData });
            expect(returnValue).toStrictEqual(mockReturnData);
        });
    });

    describe('createResponse Tests', () => {
        it('should create a new feedback response', async () => {
            const mockData = {
                feedbackId: 1,
                message:
                    'Thanks for your feedback John! We are definitely listening to your input and we are working on them!',
                adminUserId: 1,
            };

            const mockReturnData = {
                id: 1,
                feedbackId: 1,
                message:
                    'Thanks for your feedback John! We are definitely listening to your input and we are working on them!',
                adminUserId: 1,
                updatedAt: '2025-09-27T15:33:51.297Z',
                createdAt: '2025-09-27T15:33:51.297Z',
            };

            Feedback.findByPk.mockResolvedValue(true);
            FeedbackResponse.create.mockResolvedValue(mockReturnData);

            const returnValue = await FeedbackService.createResponse(mockData);

            expect(Feedback.findByPk).toHaveBeenCalledWith(mockData.feedbackId);
            expect(FeedbackResponse.create).toHaveBeenCalledWith(mockData);
            expect(returnValue).toStrictEqual(mockReturnData);
        });

        it('should throw 404 error when feedback does not exist', async () => {
            const mockData = {
                feedbackId: 404,
                message:
                    'Thanks for your feedback John! We are definitely listening to your input and we are working on them!',
                adminUserId: 1,
            };

            Feedback.findByPk.mockResolvedValue(null);
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Feedback with "feedbackId" does not exist',
                    context: {
                        key: 'feedbackId',
                        value: mockData.feedbackId,
                    },
                },
            ]);

            await expect(
                FeedbackService.createResponse(mockData),
            ).rejects.toThrow(mockError);
            expect(Feedback.findByPk).toHaveBeenCalledWith(mockData.feedbackId);
            expect(FeedbackResponse.create).not.toHaveBeenCalled();
        });
    });
});
