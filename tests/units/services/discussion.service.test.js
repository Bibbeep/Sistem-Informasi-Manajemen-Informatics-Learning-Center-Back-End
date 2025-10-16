/* eslint-disable no-undef */
jest.mock('../../../src/db/models');

const DiscussionService = require('../../../src/services/discussion.service');
const { Discussion } = require('../../../src/db/models');
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
});
