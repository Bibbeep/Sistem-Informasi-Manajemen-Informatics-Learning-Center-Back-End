/* eslint-disable no-undef */
jest.mock('../../../src/db/models');

const DiscussionService = require('../../../src/services/discussion.service');
const { Discussion, Comment } = require('../../../src/db/models');
const { Op } = require('sequelize');
const HTTPError = require('../../../src/utils/httpError');

describe('Discussion Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMany Tests', () => {
        it('should return discussions and pagination data with default query parameters', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
            };
            const mockCount = 25;
            const mockRows = Array(10).fill({
                id: 1,
                title: 'Test Discussion',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const expectedPagination = {
                currentRecords: 10,
                totalRecords: 25,
                currentPage: 1,
                totalPages: 3,
                nextPage: 2,
                prevPage: null,
            };

            Discussion.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await DiscussionService.getMany(mockParams);

            expect(Discussion.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                limit: 10,
                offset: 0,
                order: [['id', 'ASC']],
            });
            expect(result.pagination).toEqual(expectedPagination);
            expect(result.discussions).toHaveLength(10);
        });

        it('should handle title filter and descending sort on the last page', async () => {
            const mockParams = {
                page: 3,
                limit: 10,
                sort: '-createdAt',
                title: 'Informatics',
            };
            const mockCount = 25;
            const mockRows = Array(5).fill({
                id: 1,
                title: 'Test Discussion about Informatics',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const expectedPagination = {
                currentRecords: 5,
                totalRecords: 25,
                currentPage: 3,
                totalPages: 3,
                nextPage: null,
                prevPage: 2,
            };

            Discussion.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await DiscussionService.getMany(mockParams);

            expect(Discussion.findAndCountAll).toHaveBeenCalledWith({
                where: { title: 'Informatics' },
                limit: 10,
                offset: 20,
                order: [['createdAt', 'DESC']],
            });
            expect(result.pagination).toEqual(expectedPagination);
            expect(result.discussions).toHaveLength(5);
        });

        it('should return empty discussions when no records are found', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
            };
            const mockCount = 0;
            const mockRows = [];
            const expectedPagination = {
                currentRecords: 0,
                totalRecords: 0,
                currentPage: 1,
                totalPages: 0,
                nextPage: null,
                prevPage: null,
            };

            Discussion.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await DiscussionService.getMany(mockParams);

            expect(result.pagination).toEqual(expectedPagination);
            expect(result.discussions).toEqual([]);
        });

        it('should handle page number out of bounds', async () => {
            const mockParams = {
                page: 5,
                limit: 10,
                sort: 'id',
            };
            const mockCount = 25;
            const mockRows = [];
            const expectedPagination = {
                currentRecords: 0,
                totalRecords: 25,
                currentPage: 5,
                totalPages: 3,
                nextPage: null,
                prevPage: null,
            };

            Discussion.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await DiscussionService.getMany(mockParams);

            expect(result.pagination).toEqual(expectedPagination);
            expect(result.discussions).toEqual([]);
        });
    });

    describe('getOne Tests', () => {
        it('should return a single discussion forum by id', async () => {
            const mockDiscussion = {
                id: 1,
                title: 'Test Discussion',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);

            const result = await DiscussionService.getOne(1);

            expect(Discussion.findByPk).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockDiscussion);
        });

        it('should throw HTTPError 404 if discussion is not found', async () => {
            Discussion.findByPk.mockResolvedValue(null);

            await expect(DiscussionService.getOne(999)).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Discussion with "discussionId" does not exist',
                        context: {
                            key: 'discussionId',
                            value: 999,
                        },
                    },
                ]),
            );
        });
    });

    describe('create Tests', () => {
        it('should create a new discussion and return it', async () => {
            const mockData = {
                title: 'New Discussion',
                adminUserId: 1,
            };
            const mockCreatedDiscussion = {
                id: 1,
                ...mockData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            Discussion.create.mockResolvedValue(mockCreatedDiscussion);

            const result = await DiscussionService.create(mockData);

            expect(Discussion.create).toHaveBeenCalledWith(mockData);
            expect(result).toEqual({
                id: mockCreatedDiscussion.id,
                title: mockCreatedDiscussion.title,
                createdAt: mockCreatedDiscussion.createdAt,
                updatedAt: mockCreatedDiscussion.updatedAt,
            });
        });
    });

    describe('updateOne Tests', () => {
        it('should update a discussion and return it', async () => {
            const mockDiscussionId = 1;
            const mockUpdateData = { title: 'Updated Title' };
            const mockDiscussion = { id: mockDiscussionId, title: 'Old Title' };
            const mockUpdatedDiscussion = {
                id: mockDiscussionId,
                title: 'Updated Title',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Discussion.update.mockResolvedValue([1, [mockUpdatedDiscussion]]);

            const result = await DiscussionService.updateOne({
                discussionId: mockDiscussionId,
                ...mockUpdateData,
            });

            expect(Discussion.findByPk).toHaveBeenCalledWith(mockDiscussionId);
            expect(Discussion.update).toHaveBeenCalledWith(
                { title: 'Updated Title' },
                { where: { id: mockDiscussionId }, returning: true },
            );
            expect(result).toEqual({
                id: mockUpdatedDiscussion.id,
                title: mockUpdatedDiscussion.title,
                createdAt: mockUpdatedDiscussion.createdAt,
                updatedAt: mockUpdatedDiscussion.updatedAt,
            });
        });

        it('should throw HTTPError 404 if discussion is not found', async () => {
            const mockDiscussionId = 999;
            Discussion.findByPk.mockResolvedValue(null);

            await expect(
                DiscussionService.updateOne({
                    discussionId: mockDiscussionId,
                    title: 'New Title',
                }),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Discussion with "discussionId" does not exist',
                        context: {
                            key: 'discussionId',
                            value: mockDiscussionId,
                        },
                    },
                ]),
            );
            expect(Discussion.findByPk).toHaveBeenCalledWith(mockDiscussionId);
            expect(Discussion.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteOne Tests', () => {
        it('should delete a discussion successfully', async () => {
            const mockDiscussionId = 1;
            const mockDiscussion = {
                id: mockDiscussionId,
                title: 'To be deleted',
            };

            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Discussion.destroy.mockResolvedValue(1);

            await DiscussionService.deleteOne(mockDiscussionId);

            expect(Discussion.findByPk).toHaveBeenCalledWith(mockDiscussionId);
            expect(Discussion.destroy).toHaveBeenCalledWith({
                where: { id: mockDiscussionId },
            });
        });

        it('should throw HTTPError 404 if discussion to delete is not found', async () => {
            const mockDiscussionId = 999;
            Discussion.findByPk.mockResolvedValue(null);

            await expect(
                DiscussionService.deleteOne(mockDiscussionId),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Discussion with "discussionId" does not exist',
                        context: {
                            key: 'discussionId',
                            value: mockDiscussionId,
                        },
                    },
                ]),
            );

            expect(Discussion.findByPk).toHaveBeenCalledWith(mockDiscussionId);
            expect(Discussion.destroy).not.toHaveBeenCalled();
        });
    });

    describe('getManyComments Tests', () => {
        let mockCount, mockRows, mockDiscussion;

        beforeEach(() => {
            mockCount = 25;
            mockRows = Array.from({ length: 10 }, (_, i) => {
                return {
                    id: i + 1,
                    userId: i % 3 === 0 ? null : i + 1,
                    parentCommentId: null,
                    message: `Test comment ${i + 1}`,
                    createdAt: new Date(
                        `2025-10-18T10:${i < 10 ? '0' : ''}${i}:00.000Z`,
                    ),
                    updatedAt: new Date(
                        `2025-10-18T11:${i < 10 ? '0' : ''}${i}:00.000Z`,
                    ),
                    getDataValue: jest.fn((key) => {
                        if (key === 'likesCount')
                            return Math.floor(Math.random() * 10);
                        if (key === 'repliesCount')
                            return Math.floor(Math.random() * 5);
                        return undefined;
                    }),
                    user:
                        i % 3 === 0
                            ? null
                            : { id: i + 1, fullName: `User ${i + 1}` },
                };
            });

            mockDiscussion = { id: 1, title: 'Existing Discussion' };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);

            Comment.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });
        });

        it('should throw HTTPError 404 if discussion is not found', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: 999,
            };
            Discussion.findByPk.mockResolvedValue(null);

            await expect(
                DiscussionService.getManyComments(mockParams),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Discussion with "discussionId" does not exist',
                        context: {
                            key: 'discussionId',
                            value: mockParams.discussionId,
                        },
                    },
                ]),
            );

            expect(Discussion.findByPk).toHaveBeenCalledWith(
                mockParams.discussionId,
            );
            expect(Comment.findAndCountAll).not.toHaveBeenCalled();
        });

        it('should return comments and pagination data with default query parameters', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: 1,
            };
            const expectedPagination = {
                currentRecords: 10,
                totalRecords: 25,
                currentPage: 1,
                totalPages: 3,
                nextPage: 2,
                prevPage: null,
            };

            const result = await DiscussionService.getManyComments(mockParams);

            expect(Discussion.findByPk).toHaveBeenCalledWith(
                mockParams.discussionId,
            );
            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        parentCommentId: { [Op.is]: null },
                        discussionId: mockParams.discussionId,
                    },
                    limit: 10,
                    offset: 0,
                    order: [['id', 'ASC']],
                    include: expect.any(Array),
                    attributes: expect.objectContaining({
                        include: expect.any(Array),
                    }),
                }),
            );
            expect(result.pagination).toEqual(expectedPagination);
            expect(result.comments).toHaveLength(10);
            expect(result.comments[0]).toHaveProperty('likesCount');
            expect(result.comments[0]).toHaveProperty('repliesCount');
            expect(result.comments[0].fullName).toBeNull();
            expect(result.comments[1].fullName).toBe('User 2');
        });

        it('should handle sorting by likesCount descending on the second page', async () => {
            const mockParams = {
                page: 2,
                limit: 5,
                sort: '-likesCount',
                discussionId: 1,
            };
            mockCount = 12;
            mockRows = Array.from({ length: 5 }, (_, i) => {
                return {
                    id: i + 6,
                    userId: i + 6,
                    parentCommentId: null,
                    message: `Test comment ${i + 6}`,
                    createdAt: new Date(
                        `2025-10-18T10:${i + 6 < 10 ? '0' : ''}${i + 6}:00.000Z`,
                    ),
                    updatedAt: new Date(
                        `2025-10-18T11:${i + 6 < 10 ? '0' : ''}${i + 6}:00.000Z`,
                    ),
                    getDataValue: jest.fn((key) => {
                        if (key === 'likesCount') {
                            return 10 - i;
                        }

                        if (key === 'repliesCount') {
                            return Math.floor(Math.random() * 5);
                        }

                        return undefined;
                    }),
                    user: { id: i + 6, fullName: `User ${i + 6}` },
                };
            });
            Comment.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });
            const expectedPagination = {
                currentRecords: 5,
                totalRecords: 12,
                currentPage: 2,
                totalPages: 3,
                nextPage: 3,
                prevPage: 1,
            };

            const result = await DiscussionService.getManyComments(mockParams);

            expect(Discussion.findByPk).toHaveBeenCalledWith(
                mockParams.discussionId,
            );
            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        parentCommentId: { [Op.is]: null },
                        discussionId: mockParams.discussionId,
                    },
                    limit: 5,
                    offset: 5,
                    order: [['likesCount', 'DESC']],
                }),
            );
            expect(result.pagination).toEqual(expectedPagination);
            expect(result.comments).toHaveLength(5);
        });

        it('should handle sorting by repliesCount ascending', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'repliesCount',
                discussionId: 1,
            };
            await DiscussionService.getManyComments(mockParams);
            expect(Discussion.findByPk).toHaveBeenCalledWith(
                mockParams.discussionId,
            );
            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: [['repliesCount', 'ASC']],
                    where: {
                        parentCommentId: { [Op.is]: null },
                        discussionId: mockParams.discussionId,
                    },
                }),
            );
        });

        it('should handle sorting by updatedAt descending', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: '-updatedAt',
                discussionId: 1,
            };
            await DiscussionService.getManyComments(mockParams);
            expect(Discussion.findByPk).toHaveBeenCalledWith(
                mockParams.discussionId,
            );
            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: [['updatedAt', 'DESC']],
                    where: {
                        parentCommentId: { [Op.is]: null },
                        discussionId: mockParams.discussionId,
                    },
                }),
            );
        });

        it('should return empty comments when no records are found but discussion exists', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: 1,
            };
            Comment.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
            const expectedPagination = {
                currentRecords: 0,
                totalRecords: 0,
                currentPage: 1,
                totalPages: 0,
                nextPage: null,
                prevPage: null,
            };

            const result = await DiscussionService.getManyComments(mockParams);

            expect(Discussion.findByPk).toHaveBeenCalledWith(
                mockParams.discussionId,
            );
            expect(Comment.findAndCountAll).toHaveBeenCalled();
            expect(result.pagination).toEqual(expectedPagination);
            expect(result.comments).toEqual([]);
        });

        it('should handle page number out of bounds when discussion exists', async () => {
            const mockParams = {
                page: 4,
                limit: 10,
                sort: 'id',
                discussionId: 1,
            };
            Comment.findAndCountAll.mockResolvedValue({ count: 25, rows: [] });
            const expectedPagination = {
                currentRecords: 0,
                totalRecords: 25,
                currentPage: 4,
                totalPages: 3,
                nextPage: null,
                prevPage: 3,
            };

            const result = await DiscussionService.getManyComments(mockParams);

            expect(Discussion.findByPk).toHaveBeenCalledWith(
                mockParams.discussionId,
            );
            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        parentCommentId: { [Op.is]: null },
                        discussionId: mockParams.discussionId,
                    },
                    offset: 30,
                }),
            );
            expect(result.pagination).toEqual(expectedPagination);
            expect(result.comments).toEqual([]);
        });

        it('should handle calculation when prevPage is null due to totalPages + 1 condition', async () => {
            const mockParams = {
                page: 5,
                limit: 10,
                sort: 'id',
                discussionId: 1,
            };
            mockCount = 25;
            Comment.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: [],
            });
            const expectedPagination = {
                currentRecords: 0,
                totalRecords: 25,
                currentPage: 5,
                totalPages: 3,
                nextPage: null,
                prevPage: null,
            };

            const result = await DiscussionService.getManyComments(mockParams);
            expect(Discussion.findByPk).toHaveBeenCalledWith(
                mockParams.discussionId,
            );
            expect(Comment.findAndCountAll).toHaveBeenCalled();
            expect(result.pagination).toEqual(expectedPagination);
        });
    });
});
