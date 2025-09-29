/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
const { Op } = require('sequelize');
const ProgramService = require('../../../src/services/program.service');
const { Program } = require('../../../src/db/models');
const HTTPError = require('../../../src/utils/httpError');

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

    describe('getOne Tests', () => {
        it('should return program with Course details', async () => {
            const mockProgramId = 1;
            const mockCourseDetails = {
                modules: [{ id: 1 }, { id: 2 }],
            };
            const mockProgram = {
                type: 'Course',
                getCourse: jest.fn().mockResolvedValue(mockCourseDetails),
                toJSON: jest
                    .fn()
                    .mockReturnValue({ id: mockProgramId, type: 'Course' }),
            };
            Program.findByPk.mockResolvedValue(mockProgram);

            const result = await ProgramService.getOne(mockProgramId);

            expect(Program.findByPk).toHaveBeenCalledWith(mockProgramId);
            expect(mockProgram.getCourse).toHaveBeenCalled();
            expect(result).toEqual({
                id: mockProgramId,
                type: 'Course',
                details: {
                    totalModules: 2,
                },
            });
        });

        it('should return program with Workshop details', async () => {
            const mockProgramId = 2;
            const mockWorkshopDetails = {
                isOnline: true,
                videoConferenceUrl: 'http://zoom.us/w',
                locationAddress: null,
                facilitatorNames: ['John Doe'],
            };
            const mockProgram = {
                type: 'Workshop',
                getWorkshop: jest.fn().mockResolvedValue(mockWorkshopDetails),
                toJSON: jest
                    .fn()
                    .mockReturnValue({ id: mockProgramId, type: 'Workshop' }),
            };
            Program.findByPk.mockResolvedValue(mockProgram);

            const result = await ProgramService.getOne(mockProgramId);

            expect(Program.findByPk).toHaveBeenCalledWith(mockProgramId);
            expect(mockProgram.getWorkshop).toHaveBeenCalled();
            expect(result.details).toEqual(mockWorkshopDetails);
        });

        it('should return program with Seminar details', async () => {
            const mockProgramId = 3;
            const mockSeminarDetails = {
                isOnline: false,
                videoConferenceUrl: null,
                locationAddress: '123 Fake St',
                speakerNames: ['Jane Smith'],
            };
            const mockProgram = {
                type: 'Seminar',
                getSeminar: jest.fn().mockResolvedValue(mockSeminarDetails),
                toJSON: jest
                    .fn()
                    .mockReturnValue({ id: mockProgramId, type: 'Seminar' }),
            };
            Program.findByPk.mockResolvedValue(mockProgram);

            const result = await ProgramService.getOne(mockProgramId);

            expect(Program.findByPk).toHaveBeenCalledWith(mockProgramId);
            expect(mockProgram.getSeminar).toHaveBeenCalled();
            expect(result.details).toEqual(mockSeminarDetails);
        });

        it('should return program with Competition details', async () => {
            const mockProgramId = 4;
            const mockCompetitionDetails = {
                isOnline: true,
                contestRoomUrl: 'http://hackerrank.com/c',
                hostName: 'Big Corp',
                totalPrize: 1000000,
            };
            const mockProgram = {
                type: 'Competition',
                getCompetition: jest
                    .fn()
                    .mockResolvedValue(mockCompetitionDetails),
                toJSON: jest.fn().mockReturnValue({
                    id: mockProgramId,
                    type: 'Competition',
                }),
            };
            Program.findByPk.mockResolvedValue(mockProgram);

            const result = await ProgramService.getOne(mockProgramId);

            expect(Program.findByPk).toHaveBeenCalledWith(mockProgramId);
            expect(mockProgram.getCompetition).toHaveBeenCalled();
            expect(result.details).toEqual(mockCompetitionDetails);
        });

        it('should throw HTTPError 404 if program is not found', async () => {
            const mockProgramId = 999;
            Program.findByPk.mockResolvedValue(null);

            await expect(ProgramService.getOne(mockProgramId)).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Program with "programId" does not exist',
                        context: {
                            key: 'programId',
                            value: mockProgramId,
                        },
                    },
                ]),
            );
        });

        it('should handle case where course details are missing', async () => {
            const mockProgramId = 5;
            const mockProgram = {
                type: 'Course',
                getCourse: jest.fn().mockResolvedValue(null),
                toJSON: jest
                    .fn()
                    .mockReturnValue({ id: mockProgramId, type: 'Course' }),
            };
            Program.findByPk.mockResolvedValue(mockProgram);

            const result = await ProgramService.getOne(mockProgramId);

            expect(result.details).toEqual({
                totalModules: 0,
            });
        });
    });
});
