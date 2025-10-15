/* eslint-disable no-undef */
jest.mock('../../../src/db/models');

const DiscussionService = require('../../../src/services/discussion.service');
const { Discussion } = require('../../../src/db/models');

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
});
