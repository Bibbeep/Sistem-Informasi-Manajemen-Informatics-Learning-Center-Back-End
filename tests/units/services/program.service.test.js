/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
const ProgramService = require('../../../src/services/program.service');
const { Program } = require('../../../src/db/models');
const { Op } = require('sequelize');

describe('Program Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMany Tests', () => {
        it('should return programs and pagination data with all default query parameter value', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                type: 'all',
                'price.gte': 0,
            };
            const mockCount = 100;
            const mockRows = [
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
            ];
            const mockReturnValue = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 100,
                    currentPage: 1,
                    totalPages: 10,
                    nextPage: 2,
                    prevPage: null,
                },
                programs: mockRows,
            };

            Program.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const returnValue = await ProgramService.getMany(mockParams);

            expect(Program.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    priceIdr: {
                        [Op.gte]: 0,
                    },
                },
                limit: 10,
                offset: 0,
                order: [['id', 'ASC']],
            });
            expect(returnValue).toStrictEqual(mockReturnValue);
        });

        it('should return programs and pagination data with filter type Course and price less than 1000000', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                type: 'course',
                'price.gte': 0,
                'price.lte': 1000000,
            };
            const mockCount = 100;
            const mockRows = [
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
            ];
            const mockReturnValue = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 100,
                    currentPage: 1,
                    totalPages: 10,
                    nextPage: 2,
                    prevPage: null,
                },
                programs: mockRows,
            };

            Program.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const returnValue = await ProgramService.getMany(mockParams);

            expect(Program.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    priceIdr: {
                        [Op.gte]: 0,
                        [Op.lte]: 1000000,
                    },
                    type: 'Course',
                },
                limit: 10,
                offset: 0,
                order: [['id', 'ASC']],
            });
            expect(returnValue).toStrictEqual(mockReturnValue);
        });

        it('should return programs and pagination data with filter type Course, price less than 1000000, last page, and sort by availableDate descending', async () => {
            const mockParams = {
                page: 10,
                limit: 10,
                sort: '-availableDate',
                type: 'course',
                'price.gte': 0,
                'price.lte': 1000000,
            };
            const mockCount = 100;
            const mockRows = [
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
                {
                    dummy: 'program',
                },
            ];
            const mockReturnValue = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 100,
                    currentPage: 10,
                    totalPages: 10,
                    nextPage: null,
                    prevPage: 9,
                },
                programs: mockRows,
            };

            Program.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const returnValue = await ProgramService.getMany(mockParams);

            expect(Program.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    priceIdr: {
                        [Op.gte]: 0,
                        [Op.lte]: 1000000,
                    },
                    type: 'Course',
                },
                limit: 10,
                offset: 90,
                order: [['availableDate', 'DESC']],
            });
            expect(returnValue).toStrictEqual(mockReturnValue);
        });

        it('should return empty programs and pagination data with page out of bound', async () => {
            const mockParams = {
                page: 100,
                limit: 10,
                sort: 'id',
                type: 'all',
                'price.gte': 0,
            };
            const mockCount = 100;
            const mockRows = [];
            const mockReturnValue = {
                pagination: {
                    currentRecords: 0,
                    totalRecords: 100,
                    currentPage: 100,
                    totalPages: 10,
                    nextPage: null,
                    prevPage: null,
                },
                programs: mockRows,
            };

            Program.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const returnValue = await ProgramService.getMany(mockParams);

            expect(Program.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    priceIdr: {
                        [Op.gte]: 0,
                    },
                },
                limit: 10,
                offset: 990,
                order: [['id', 'ASC']],
            });
            expect(returnValue).toStrictEqual(mockReturnValue);
        });
    });
});
