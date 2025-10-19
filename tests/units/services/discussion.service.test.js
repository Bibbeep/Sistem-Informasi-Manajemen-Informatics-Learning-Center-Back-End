/* eslint-disable no-undef */
jest.mock('../../../src/db/models');

const DiscussionService = require('../../../src/services/discussion.service');
const { Discussion, Comment, sequelize } = require('../../../src/db/models');
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
        const mockDiscussionId = 1;
        const mockDiscussion = { id: mockDiscussionId };

        const mockCommentsData = Array.from({ length: 5 }, (_, i) => {
            return {
                id: i + 1,
                userId: i + 1,
                parentCommentId: null,
                message: `Comment ${i + 1}`,
                getDataValue: jest.fn((key) => {
                    if (key === 'likesCount') {
                        return i;
                    }

                    if (key === 'repliesCount') {
                        return i % 2;
                    }

                    return undefined;
                }),
                user: {
                    id: i + 1,
                    fullName: `User ${i + 1}`,
                },
                createdAt: new Date(`2025-10-19T10:0${i}:00Z`),
                updatedAt: new Date(`2025-10-19T10:0${i}:00Z`),
            };
        });

        const mockRepliesData = Array.from({ length: 2 }, (_, i) => {
            return {
                id: 10 + i + 1,
                userId: i + 1,
                parentCommentId: 1,
                message: `Reply ${i + 1}`,
                getDataValue: jest.fn((key) => {
                    if (key === 'likesCount') {
                        return 0;
                    }

                    if (key === 'repliesCount') {
                        return 0;
                    }

                    return undefined;
                }),
                user: {
                    id: i + 1,
                    fullName: `User ${i + 1}`,
                },
                createdAt: new Date(`2025-10-19T11:0${i}:00Z`),
                updatedAt: new Date(`2025-10-19T11:0${i}:00Z`),
            };
        });

        beforeEach(() => {
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Comment.findAndCountAll.mockImplementation(
                ({ where, limit, offset, order }) => {
                    let rows = [];
                    let count = 0;

                    if (
                        where.parentCommentId === null ||
                        where.parentCommentId === undefined
                    ) {
                        rows = mockCommentsData;
                        count = mockCommentsData.length;
                    } else if (where.parentCommentId === 1) {
                        rows = mockRepliesData;
                        count = mockRepliesData.length;
                    }

                    if (order && order[0] && order[0][0] === 'id') {
                        rows.sort((a, b) => {
                            return order[0][1] === 'DESC'
                                ? b.id - a.id
                                : a.id - b.id;
                        });
                    }
                    if (order && order[0] && order[0][0] === 'createdAt') {
                        rows.sort((a, b) => {
                            return order[0][1] === 'DESC'
                                ? b.createdAt - a.createdAt
                                : a.createdAt - b.createdAt;
                        });
                    }
                    if (order && order[0] && order[0][0] === 'likesCount') {
                        rows.sort((a, b) => {
                            return order[0][1] === 'DESC'
                                ? b.getDataValue('likesCount') -
                                      a.getDataValue('likesCount')
                                : a.getDataValue('likesCount') -
                                      b.getDataValue('likesCount');
                        });
                    }
                    if (order && order[0] && order[0][0] === 'repliesCount') {
                        rows.sort((a, b) => {
                            return order[0][1] === 'DESC'
                                ? b.getDataValue('repliesCount') -
                                      a.getDataValue('repliesCount')
                                : a.getDataValue('repliesCount') -
                                      b.getDataValue('repliesCount');
                        });
                    }

                    const paginatedRows = rows.slice(offset, offset + limit);

                    return Promise.resolve({ count, rows: paginatedRows });
                },
            );
        });

        it('should return comments and pagination data with default parameters (top-level comments)', async () => {
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: mockDiscussionId,
            };
            const result = await DiscussionService.getManyComments(data);

            expect(Discussion.findByPk).toHaveBeenCalledWith(mockDiscussionId);
            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        discussionId: mockDiscussionId,
                        parentCommentId: undefined,
                    },
                    limit: 10,
                    offset: 0,
                    order: [['id', 'ASC']],
                }),
            );
            expect(result.comments).toHaveLength(5);
            expect(result.pagination.totalRecords).toBe(5);
            expect(result.pagination.currentPage).toBe(1);
            expect(result.pagination.totalPages).toBe(1);
            expect(result.comments[0]).toEqual(
                expect.objectContaining({
                    id: 1,
                    userId: 1,
                    fullName: 'User 1',
                    parentCommentId: null,
                    message: 'Comment 1',
                    likesCount: 0,
                    repliesCount: 0,
                }),
            );
        });

        it('should return comments with specific pagination and sort (likesCount DESC)', async () => {
            const data = {
                page: 1,
                limit: 3,
                sort: '-likesCount',
                discussionId: mockDiscussionId,
            };
            const result = await DiscussionService.getManyComments(data);

            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 3,
                    offset: 0,
                    order: [['likesCount', 'DESC']],
                }),
            );
            expect(result.comments).toHaveLength(3);
            expect(result.pagination).toEqual({
                currentRecords: 3,
                totalRecords: 5,
                currentPage: 1,
                totalPages: 2,
                nextPage: 2,
                prevPage: null,
            });
            expect(result.comments[0].likesCount).toBe(4);
        });

        it('should return comments with specific pagination and sort (repliesCount DESC)', async () => {
            const data = {
                page: 1,
                limit: 3,
                sort: '-repliesCount',
                discussionId: mockDiscussionId,
            };
            const result = await DiscussionService.getManyComments(data);

            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 3,
                    offset: 0,
                    order: [['repliesCount', 'DESC']],
                }),
            );
            expect(result.comments).toHaveLength(3);
            expect(result.pagination).toEqual({
                currentRecords: 3,
                totalRecords: 5,
                currentPage: 1,
                totalPages: 2,
                nextPage: 2,
                prevPage: null,
            });
            expect(result.comments[0].repliesCount).toBe(1);
            expect(result.comments[1].repliesCount).toBe(1);
            expect(result.comments[2].repliesCount).toBe(0);
        });

        it('should return comments with specific pagination and sort (createdAt ASC)', async () => {
            const data = {
                page: 1,
                limit: 3,
                sort: 'createdAt',
                discussionId: mockDiscussionId,
            };
            const result = await DiscussionService.getManyComments(data);

            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 3,
                    offset: 0,
                    order: [['createdAt', 'ASC']],
                }),
            );
            expect(result.comments[0].id).toBe(1);
            expect(result.comments[1].id).toBe(2);
            expect(result.comments[2].id).toBe(3);
        });

        it('should return replies when parentCommentId is provided', async () => {
            const parentCommentId = 1;
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: mockDiscussionId,
                parentCommentId,
            };
            const result = await DiscussionService.getManyComments(data);

            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        discussionId: mockDiscussionId,
                        parentCommentId: parentCommentId,
                    },
                }),
            );
            expect(result.comments).toHaveLength(2);
            expect(result.pagination.totalRecords).toBe(2);
            expect(result.comments[0].parentCommentId).toBe(parentCommentId);
            expect(result.comments[1].parentCommentId).toBe(parentCommentId);
        });

        it('should handle parentCommentId=0 as null', async () => {
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: mockDiscussionId,
                parentCommentId: null,
            };
            await DiscussionService.getManyComments(data);

            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        discussionId: mockDiscussionId,
                        parentCommentId: null,
                    },
                }),
            );
        });

        it('should return empty comments and correct pagination when page is out of bounds', async () => {
            const data = {
                page: 10,
                limit: 3,
                sort: 'id',
                discussionId: mockDiscussionId,
            };
            const result = await DiscussionService.getManyComments(data);

            expect(Comment.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 3,
                    offset: 27,
                }),
            );
            expect(result.comments).toHaveLength(0);
            expect(result.pagination).toEqual({
                currentRecords: 0,
                totalRecords: 5,
                currentPage: 10,
                totalPages: 2,
                nextPage: null,
                prevPage: null,
            });
        });

        it('should throw HTTPError 404 if discussion does not exist', async () => {
            const nonExistentDiscussionId = 999;
            Discussion.findByPk.mockResolvedValue(null);
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: nonExistentDiscussionId,
            };

            await expect(
                DiscussionService.getManyComments(data),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Discussion with "discussionId" does not exist',
                        context: {
                            key: 'discussionId',
                            value: nonExistentDiscussionId,
                        },
                    },
                ]),
            );
            expect(Discussion.findByPk).toHaveBeenCalledWith(
                nonExistentDiscussionId,
            );
            expect(Comment.findAndCountAll).not.toHaveBeenCalled();
        });

        it('should return empty list if no comments found', async () => {
            Comment.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: mockDiscussionId,
            };
            const result = await DiscussionService.getManyComments(data);

            expect(result.comments).toHaveLength(0);
            expect(result.pagination.totalRecords).toBe(0);
        });

        it('should correctly handle user null case (user deleted)', async () => {
            const mockCommentWithNullUser = {
                ...mockCommentsData[0],
                user: null,
            };
            Comment.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [mockCommentWithNullUser],
            });
            const data = {
                page: 1,
                limit: 10,
                sort: 'id',
                discussionId: mockDiscussionId,
            };
            const result = await DiscussionService.getManyComments(data);

            expect(result.comments[0].fullName).toBeNull();
        });

        it('should return comments with page > 1', async () => {
            const mockData = {
                page: 2,
                limit: 10,
                sort: 'id',
                discussionId: 1,
            };
            const mockDiscussion = {
                id: 1,
            };
            const mockCount = 21;
            const mockRows = [
                {
                    id: 2,
                    userId: 1,
                    user: {
                        fullName: 'John Doe',
                    },
                    parentCommentId: 1,
                    message: 'Lorem ipsum',
                    getDataValue: jest.fn(() => {
                        return 1;
                    }),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Comment.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await DiscussionService.getManyComments(mockData);

            expect(result.pagination.currentRecords).toBe(1);
            expect(result.pagination.totalRecords).toBe(21);
        });
    });

    describe('getOneComment Tests', () => {
        it('should throw 404 when discussion does not exist', async () => {
            const mockData = {
                discussionId: 404,
                commentId: 1,
                includeReplies: true,
            };
            Discussion.findByPk.mockResolvedValue(null);

            await expect(
                DiscussionService.getOneComment(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Discussion with "discussionId" does not exist',
                        context: {
                            key: 'discussionId',
                            value: mockData.discussionId,
                        },
                    },
                ]),
            );
        });

        it('should throw 404 when comment does not exist', async () => {
            const mockData = {
                discussionId: 1,
                commentId: 404,
                includeReplies: false,
            };
            const mockDiscussion = {
                id: 1,
            };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Comment.findOne.mockResolvedValue(null);

            await expect(
                DiscussionService.getOneComment(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Comment with "commentId" does not exist',
                        context: {
                            key: 'commentId',
                            value: mockData.commentId,
                        },
                    },
                ]),
            );
        });

        it('should return result', async () => {
            const mockData = {
                discussionId: 1,
                commentId: 1,
                includeReplies: true,
            };
            const mockDiscussion = {
                id: 1,
            };
            const mockComment = {
                id: 1,
                userId: 1,
                user: {
                    fullName: 'John',
                },
                parentCommentId: 2,
                message: 'Lorem ipsum',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                getDataValue: jest.fn(() => {
                    return 1;
                }),
                replies: [
                    {
                        id: 3,
                        userId: 3,
                        user: { fullName: 'Jane' },
                        message: 'Lorem ipsum',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                        getDataValue: jest.fn(() => {
                            return 1;
                        }),
                    },
                ],
            };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            sequelize.literal.mockReturnValue(true);
            Comment.findOne.mockResolvedValue(mockComment);

            const result = await DiscussionService.getOneComment(mockData);

            expect(result).toBeDefined();
        });

        it('should return result with deleted user', async () => {
            const mockData = {
                discussionId: 1,
                commentId: 1,
                includeReplies: true,
            };
            const mockDiscussion = {
                id: 1,
            };
            const mockComment = {
                id: 1,
                userId: 1,
                parentCommentId: 2,
                message: 'Lorem ipsum',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                getDataValue: jest.fn(() => {
                    return 0;
                }),
                replies: [
                    {
                        id: 3,
                        userId: 3,
                        user: { fullName: 'Jane' },
                        message: 'Lorem ipsum',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                        getDataValue: jest.fn(() => {
                            return 0;
                        }),
                    },
                    {
                        id: 4,
                        userId: 3,
                        message: 'Lorem ipsum',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                        getDataValue: jest.fn(() => {
                            return 1;
                        }),
                    },
                ],
            };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            sequelize.literal.mockReturnValue(true);
            Comment.findOne.mockResolvedValue(mockComment);

            const result = await DiscussionService.getOneComment(mockData);

            expect(result).toBeDefined();
        });

        it('should return result without replies', async () => {
            const mockData = {
                discussionId: 1,
                commentId: 1,
                includeReplies: false,
            };
            const mockDiscussion = {
                id: 1,
            };
            const mockComment = {
                id: 1,
                userId: 1,
                parentCommentId: 2,
                message: 'Lorem ipsum',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                getDataValue: jest.fn(() => {
                    return 1;
                }),
            };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            sequelize.literal.mockReturnValue(true);
            Comment.findOne.mockResolvedValue(mockComment);

            const result = await DiscussionService.getOneComment(mockData);

            expect(result).toBeDefined();
        });
    });

    describe('createComment Tests', () => {
        it('should return new top-level comment', async () => {
            const mockData = {
                discussionId: 1,
                parentCommentId: null,
                userId: 1,
                message: 'Lorem ipsum',
            };
            const mockDiscussion = {
                id: 1,
            };
            const mockComment = {
                id: 1,
                discusssionId: 1,
                userId: 1,
                parentCommentId: null,
                message: 'Lorem ipsum',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Comment.findOne.mockResolvedValue(true);
            Comment.create.mockResolvedValue(mockComment);

            const result = await DiscussionService.createComment(mockData);

            expect(result).toBe(mockComment);
        });

        it('should return new reply', async () => {
            const mockData = {
                discussionId: 1,
                parentCommentId: 1,
                userId: 1,
                message: 'Lorem ipsum',
            };
            const mockDiscussion = {
                id: 1,
            };
            const mockComment = {
                id: 1,
                discusssionId: 1,
                userId: 1,
                parentCommentId: 1,
                message: 'Lorem ipsum',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Comment.findOne.mockResolvedValue(true);
            Comment.create.mockResolvedValue(mockComment);

            const result = await DiscussionService.createComment(mockData);

            expect(result).toBe(mockComment);
        });

        it('should throw 404 error when discussion does not exist', async () => {
            const mockData = {
                discussionId: 404,
                parentCommentId: 1,
                userId: 1,
                message: 'Lorem ipsum',
            };
            Discussion.findByPk.mockResolvedValue(null);

            await expect(
                DiscussionService.createComment(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Discussion with "discussionId" does not exist',
                        context: {
                            key: 'discussionId',
                            value: mockData.discussionId,
                        },
                    },
                ]),
            );
        });

        it('should throw 404 error when parent comment does not exist', async () => {
            const mockData = {
                discussionId: 1,
                parentCommentId: 404,
                userId: 1,
                message: 'Lorem ipsum',
            };
            const mockDiscussion = {
                id: 1,
            };
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Comment.findOne.mockResolvedValue(null);

            await expect(
                DiscussionService.createComment(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Comment with "parentCommentId" does not exist',
                        context: {
                            key: 'parentCommentId',
                            value: mockData.parentCommentId,
                        },
                    },
                ]),
            );
        });
    });

    describe('updateOneComment Tests', () => {
        const mockDiscussionId = 1;
        const mockCommentId = 5;
        const mockUserId = 10;
        const mockUpdateData = { message: 'Updated comment message.' };
        const mockDiscussion = { id: mockDiscussionId };
        const mockCommentInstance = {
            id: mockCommentId,
            discussionId: mockDiscussionId,
            userId: mockUserId,
            message: 'Original message',
            toJSON: jest.fn(() => {
                return {
                    id: mockCommentId,
                    discussionId: mockDiscussionId,
                    userId: mockUserId,
                    message: mockUpdateData.message,
                    createdAt: new Date('2025-10-19T10:00:00Z'),
                    updatedAt: new Date('2025-10-19T11:00:00Z'),
                };
            }),
        };

        beforeEach(() => {
            Discussion.findByPk.mockResolvedValue(mockDiscussion);
            Comment.findOne.mockResolvedValue(mockCommentInstance);
            Comment.update.mockResolvedValue([1, [mockCommentInstance]]);
        });

        it('should update the comment message successfully', async () => {
            const data = {
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                message: mockUpdateData.message,
            };
            const result = await DiscussionService.updateOneComment(data);

            expect(Discussion.findByPk).toHaveBeenCalledWith(mockDiscussionId);
            expect(Comment.findOne).toHaveBeenCalledWith({
                where: {
                    id: mockCommentId,
                    discussionId: mockDiscussionId,
                },
            });
            expect(Comment.update).toHaveBeenCalledWith(
                { message: mockUpdateData.message },
                {
                    where: {
                        discussionId: mockDiscussionId,
                        id: mockCommentId,
                    },
                    returning: true,
                },
            );
            expect(result).toEqual(mockCommentInstance.toJSON());
        });

        it('should throw HTTPError 404 if discussion does not exist', async () => {
            const nonExistentDiscussionId = 999;
            Discussion.findByPk.mockResolvedValue(null);
            const data = {
                discussionId: nonExistentDiscussionId,
                commentId: mockCommentId,
                message: mockUpdateData.message,
            };

            await expect(
                DiscussionService.updateOneComment(data),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Discussion with "discussionId" does not exist',
                        context: {
                            key: 'discussionId',
                            value: nonExistentDiscussionId,
                        },
                    },
                ]),
            );
            expect(Discussion.findByPk).toHaveBeenCalledWith(
                nonExistentDiscussionId,
            );
            expect(Comment.findOne).not.toHaveBeenCalled();
            expect(Comment.update).not.toHaveBeenCalled();
        });

        it('should throw HTTPError 404 if comment does not exist within the discussion', async () => {
            const nonExistentCommentId = 999;
            Comment.findOne.mockResolvedValue(null);
            const data = {
                discussionId: mockDiscussionId,
                commentId: nonExistentCommentId,
                message: mockUpdateData.message,
            };

            await expect(
                DiscussionService.updateOneComment(data),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Comment with "commentId" does not exist',
                        context: {
                            key: 'commentId',
                            value: nonExistentCommentId,
                        },
                    },
                ]),
            );
            expect(Discussion.findByPk).toHaveBeenCalledWith(mockDiscussionId);
            expect(Comment.findOne).toHaveBeenCalledWith({
                where: {
                    id: nonExistentCommentId,
                    discussionId: mockDiscussionId,
                },
            });
            expect(Comment.update).not.toHaveBeenCalled();
        });

        it('should throw error if Comment.update fails', async () => {
            const data = {
                discussionId: mockDiscussionId,
                commentId: mockCommentId,
                message: mockUpdateData.message,
            };
            const updateError = new Error('Database update failed');
            Comment.update.mockRejectedValue(updateError);

            await expect(
                DiscussionService.updateOneComment(data),
            ).rejects.toThrow(updateError);

            expect(Discussion.findByPk).toHaveBeenCalledWith(mockDiscussionId);
            expect(Comment.findOne).toHaveBeenCalledWith({
                where: {
                    id: mockCommentId,
                    discussionId: mockDiscussionId,
                },
            });
            expect(Comment.update).toHaveBeenCalled();
        });
    });
});
