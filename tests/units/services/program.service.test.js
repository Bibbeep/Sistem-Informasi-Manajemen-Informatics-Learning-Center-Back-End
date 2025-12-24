/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
jest.mock('file-type', () => {
    return {
        fromBuffer: jest.fn(),
    };
});
jest.mock('@aws-sdk/lib-storage', () => {
    return {
        Upload: jest.fn().mockImplementation(() => {
            return {
                done: jest.fn().mockResolvedValue({
                    Location: 'https://mock-s3-location.com/new-thumbnail.webp',
                }),
            };
        }),
    };
});
jest.mock('@aws-sdk/client-s3', () => {
    return {
        DeleteObjectCommand: jest.fn(),
    };
});
jest.mock('../../../src/configs/s3', () => {
    return {
        s3: {
            send: jest.fn(),
        },
    };
});
jest.mock('sharp', () => {
    return jest.fn(() => {
        return {
            webp: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue('compressed-buffer'),
        };
    });
});
const { Op, fn } = require('sequelize');
const ProgramService = require('../../../src/services/program.service');
const {
    Program,
    Course,
    Workshop,
    Seminar,
    Competition,
    CourseModule,
    sequelize,
} = require('../../../src/db/models');
const HTTPError = require('../../../src/utils/httpError');
const { fromBuffer } = require('file-type');
const sharp = require('sharp');
const { Upload } = require('@aws-sdk/lib-storage');
const { s3 } = require('../../../src/configs/s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

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

        it('should return programs and pagination data with full-text search query', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                type: 'all',
                'price.gte': 0,
                q: 'query',
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
                    _search: {
                        [Op.match]: fn(
                            'plainto_tsquery',
                            'english',
                            mockParams.q,
                        ),
                    },
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

        it('should return program and with id query param', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                type: 'all',
                id: 1,
            };
            const mockCount = 1;
            const mockRows = new Array(1);
            const mockReturnValue = {
                pagination: {
                    currentRecords: 1,
                    totalRecords: 1,
                    currentPage: 1,
                    totalPages: 1,
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

            expect(Program.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(returnValue).toStrictEqual(mockReturnValue);
        });

        it('should return available programs and with isAvailable query param', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                type: 'all',
                id: 1,
                isAvailable: true,
            };
            const mockCount = 15;
            const mockRows = new Array(10);
            const mockReturnValue = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 15,
                    currentPage: 1,
                    totalPages: 2,
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

            expect(Program.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(returnValue).toStrictEqual(mockReturnValue);
        });

        it('should return unavailable programs and with isAvailable query param', async () => {
            const mockParams = {
                page: 1,
                limit: 10,
                sort: 'id',
                type: 'all',
                id: 1,
                isAvailable: false,
            };
            const mockCount = 5;
            const mockRows = new Array(5);
            const mockReturnValue = {
                pagination: {
                    currentRecords: 5,
                    totalRecords: 5,
                    currentPage: 1,
                    totalPages: 1,
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

            expect(Program.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
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

    describe('create Tests', () => {
        it('should create a new Course program', async () => {
            const mockData = {
                title: 'New Course',
                description: 'A new course',
                availableDate: new Date(),
                type: 'Course',
                priceIdr: 100000,
            };

            const mockProgram = {
                id: 1,
                ...mockData,
                toJSON: jest.fn().mockReturnValue({ id: 1, ...mockData }),
            };

            Program.create = jest.fn().mockResolvedValue(mockProgram);
            Course.create.mockResolvedValue({ id: 1, programId: 1 });

            const result = await ProgramService.create(mockData);

            expect(Program.create).toHaveBeenCalledWith({
                title: mockData.title,
                description: mockData.description,
                availableDate: mockData.availableDate,
                type: mockData.type,
                priceIdr: mockData.priceIdr,
            });

            expect(Course.create).toHaveBeenCalledWith({ programId: 1 });
            expect(result).toEqual({ ...mockProgram.toJSON(), details: {} });
        });

        it('should create a new Workshop program', async () => {
            const mockData = {
                title: 'New Workshop',
                description: 'A new workshop',
                availableDate: new Date(),
                type: 'Workshop',
                priceIdr: 200000,
                isOnline: true,
                startDate: new Date(),
                videoConferenceUrl: 'http://zoom.us/w',
                locationAddress: null,
                facilitatorNames: ['John Doe'],
            };
            const mockProgram = {
                id: 1,
                ...mockData,
                toJSON: jest.fn().mockReturnValue({ id: 1, ...mockData }),
            };
            Program.create = jest.fn().mockResolvedValue(mockProgram);
            Workshop.create.mockResolvedValue({
                id: 1,
                programId: 1,
                ...mockData,
            });

            const result = await ProgramService.create(mockData);

            expect(Program.create).toHaveBeenCalled();
            expect(Workshop.create).toHaveBeenCalledWith({
                programId: 1,
                isOnline: mockData.isOnline,
                startDate: mockData.startDate,
                endDate: null,
                videoConferenceUrl: mockData.videoConferenceUrl,
                locationAddress: mockData.locationAddress,
                facilitatorNames: mockData.facilitatorNames,
            });
            expect(result.details).toEqual({
                startDate: mockData.startDate,
                endDate: null,
                isOnline: mockData.isOnline,
                videoConferenceUrl: mockData.videoConferenceUrl,
                locationAddress: mockData.locationAddress,
                facilitatorNames: mockData.facilitatorNames,
            });
        });

        it('should create a new Seminar program', async () => {
            const mockData = {
                title: 'New Seminar',
                description: 'A new seminar',
                availableDate: new Date(),
                type: 'Seminar',
                priceIdr: 50000,
                isOnline: false,
                startDate: new Date(),
                videoConferenceUrl: null,
                locationAddress: '123 Fake St',
                speakerNames: ['Jane Smith'],
            };

            const mockProgram = {
                id: 1,
                ...mockData,
                toJSON: jest.fn().mockReturnValue({ id: 1, ...mockData }),
            };
            Program.create = jest.fn().mockResolvedValue(mockProgram);
            Seminar.create.mockResolvedValue({
                id: 1,
                programId: 1,
                ...mockData,
            });
            const result = await ProgramService.create(mockData);
            expect(Program.create).toHaveBeenCalled();
            expect(Seminar.create).toHaveBeenCalledWith({
                programId: 1,
                isOnline: mockData.isOnline,
                startDate: mockData.startDate,
                endDate: null,
                videoConferenceUrl: mockData.videoConferenceUrl,
                locationAddress: mockData.locationAddress,
                speakerNames: mockData.speakerNames,
            });
            expect(result.details).toEqual({
                isOnline: mockData.isOnline,
                startDate: mockData.startDate,
                endDate: null,
                videoConferenceUrl: mockData.videoConferenceUrl,
                locationAddress: mockData.locationAddress,
                speakerNames: mockData.speakerNames,
            });
        });

        it('should create a new Competition program', async () => {
            const mockData = {
                title: 'New Competition',
                description: 'A new competition',
                availableDate: new Date(),
                type: 'Competition',
                priceIdr: 0,
                isOnline: true,
                startDate: new Date(),
                videoConferenceUrl: 'http://meet.google.com/c',
                locationAddress: null,
                contestRoomUrl: 'http://hackerrank.com/c',
                hostName: 'Big Corp',
                totalPrize: 10000000,
            };

            const mockProgram = {
                id: 1,
                ...mockData,
                toJSON: jest.fn().mockReturnValue({ id: 1, ...mockData }),
            };
            Program.create = jest.fn().mockResolvedValue(mockProgram);
            Competition.create.mockResolvedValue({
                id: 1,
                programId: 1,
                ...mockData,
            });

            const result = await ProgramService.create(mockData);

            expect(Program.create).toHaveBeenCalled();
            expect(Competition.create).toHaveBeenCalledWith({
                programId: 1,
                isOnline: mockData.isOnline,
                startDate: mockData.startDate,
                endDate: null,
                videoConferenceUrl: mockData.videoConferenceUrl,
                locationAddress: mockData.locationAddress,
                contestRoomUrl: mockData.contestRoomUrl,
                hostName: mockData.hostName,
                totalPrize: mockData.totalPrize,
            });

            expect(result.details).toEqual({
                isOnline: mockData.isOnline,
                startDate: mockData.startDate,
                endDate: null,
                videoConferenceUrl: mockData.videoConferenceUrl,
                locationAddress: mockData.locationAddress,
                contestRoomUrl: mockData.contestRoomUrl,
                hostName: mockData.hostName,
                totalPrize: mockData.totalPrize,
            });
        });
    });

    describe('updateOne Tests', () => {
        it('should update a Course program', async () => {
            const mockProgramId = 1;
            const mockUpdateData = {
                title: 'Updated Course',
                type: 'Course',
            };

            const mockProgram = {
                id: mockProgramId,
                type: 'Course',
                toJSON: () => {
                    return {
                        id: mockProgramId,
                        type: 'Course',
                        title: 'Updated Course',
                    };
                },
            };

            Program.findByPk.mockResolvedValue(mockProgram);
            Program.update.mockResolvedValue([1, [mockProgram]]);
            CourseModule.count.mockResolvedValue(5);
            sequelize.transaction.mockImplementation(async (callback) => {
                return callback();
            });

            const result = await ProgramService.updateOne({
                programId: mockProgramId,
                updateData: mockUpdateData,
            });

            expect(result.details).toEqual({ totalModules: 5 });
        });

        it('should update a Seminar program', async () => {
            const mockProgramId = 2;
            const mockUpdateData = {
                title: 'Updated Seminar',
                type: 'Seminar',
                speakerNames: ['Dr. Strange'],
            };
            const mockProgram = {
                id: mockProgramId,
                type: 'Seminar',
                toJSON: () => {
                    return {
                        id: mockProgramId,
                        type: 'Seminar',
                        title: 'Updated Seminar',
                    };
                },
            };
            const mockSeminar = {
                toJSON: () => {
                    return {
                        id: 1,
                        programId: mockProgramId,
                        speakerNames: ['Dr. Strange'],
                    };
                },
            };

            Program.findByPk.mockResolvedValue(mockProgram);
            Program.update.mockResolvedValue([1, [mockProgram]]);
            Seminar.update.mockResolvedValue([1, [mockSeminar]]);
            sequelize.transaction.mockImplementation(async (callback) => {
                return callback();
            });

            const result = await ProgramService.updateOne({
                programId: mockProgramId,
                updateData: mockUpdateData,
            });

            expect(result.details.speakerNames).toEqual(['Dr. Strange']);
        });

        it('should update a Workshop program', async () => {
            const mockProgramId = 3;
            const mockUpdateData = {
                title: 'Updated Workshop',
                type: 'Workshop',
                facilitatorNames: ['Tony Stark'],
            };
            const mockProgram = {
                id: mockProgramId,
                type: 'Workshop',
                toJSON: () => {
                    return {
                        id: mockProgramId,
                        type: 'Workshop',
                        title: 'Updated Workshop',
                    };
                },
            };
            const mockWorkshop = {
                toJSON: () => {
                    return {
                        id: 1,
                        programId: mockProgramId,
                        facilitatorNames: ['Tony Stark'],
                    };
                },
            };

            Program.findByPk.mockResolvedValue(mockProgram);
            Program.update.mockResolvedValue([1, [mockProgram]]);
            Workshop.update.mockResolvedValue([1, [mockWorkshop]]);
            sequelize.transaction.mockImplementation(async (callback) => {
                return callback();
            });

            const result = await ProgramService.updateOne({
                programId: mockProgramId,
                updateData: mockUpdateData,
            });

            expect(result.details.facilitatorNames).toEqual(['Tony Stark']);
        });

        it('should update a Competition program', async () => {
            const mockProgramId = 4;
            const mockUpdateData = {
                title: 'Updated Competition',
                type: 'Competition',
                totalPrize: 50000,
            };
            const mockProgram = {
                id: mockProgramId,
                type: 'Competition',
                toJSON: () => {
                    return {
                        id: mockProgramId,
                        type: 'Competition',
                        title: 'Updated Competition',
                    };
                },
            };
            const mockCompetition = {
                toJSON: () => {
                    return {
                        id: 1,
                        programId: mockProgramId,
                        totalPrize: 50000,
                    };
                },
            };

            Program.findByPk.mockResolvedValue(mockProgram);
            Program.update.mockResolvedValue([1, [mockProgram]]);
            Competition.update.mockResolvedValue([1, [mockCompetition]]);
            sequelize.transaction.mockImplementation(async (callback) => {
                return callback();
            });

            const result = await ProgramService.updateOne({
                programId: mockProgramId,
                updateData: mockUpdateData,
            });

            expect(result.details.totalPrize).toEqual(50000);
        });

        it('should throw 404 error if program does not exist', async () => {
            Program.findByPk.mockResolvedValue(null);

            await expect(
                ProgramService.updateOne({
                    programId: 999,
                    updateData: { type: 'Course' },
                }),
            ).rejects.toThrow(HTTPError);

            await expect(
                ProgramService.updateOne({
                    programId: 999,
                    updateData: { type: 'Course' },
                }),
            ).rejects.toHaveProperty('statusCode', 404);
        });

        it('should throw 400 error if user try to change type', async () => {
            const mockProgram = { id: 1, type: 'Course' };
            Program.findByPk.mockResolvedValue(mockProgram);

            await expect(
                ProgramService.updateOne({
                    programId: 1,
                    updateData: { type: 'Seminar' },
                }),
            ).rejects.toThrow(HTTPError);

            await expect(
                ProgramService.updateOne({
                    programId: 1,
                    updateData: { type: 'Seminar' },
                }),
            ).rejects.toHaveProperty('statusCode', 400);
        });
    });

    describe('deleteOne Tests', () => {
        it('should delete a program', async () => {
            const mockProgramId = 1;
            Program.findByPk.mockResolvedValue({ id: 1 });
            Program.destroy.mockResolvedValue();

            await ProgramService.deleteOne(mockProgramId);

            expect(Program.findByPk).toHaveBeenCalledWith(mockProgramId);
            expect(Program.destroy).toHaveBeenCalledWith({
                where: { id: mockProgramId },
            });
        });

        it('should throw 404 error if program does not exist', async () => {
            const mockProgramId = 404;
            Program.findByPk.mockResolvedValue(null);
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Program with "programId" does not exist',
                    context: {
                        key: 'programId',
                        value: mockProgramId,
                    },
                },
            ]);

            await expect(
                ProgramService.deleteOne(mockProgramId),
            ).rejects.toThrow(mockError);
            expect(Program.findByPk).toHaveBeenCalledWith(mockProgramId);
        });
    });

    describe('uploadThumbnail Tests', () => {
        it('should upload a new thumbnail and update the program record', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                programId: 1,
            };
            const mockProgram = {
                id: 1,
                thumbnailUrl: null,
            };
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue({ mime: 'image/png' });

            await ProgramService.uploadThumbnail(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(mockData.programId);
            expect(sharp).toHaveBeenCalledWith(mockData.file.buffer);
            expect(Upload).toHaveBeenCalledTimes(1);
            expect(Program.update).toHaveBeenCalledWith(
                {
                    thumbnailUrl: expect.any(String),
                },
                { where: { id: mockData.programId } },
            );
            expect(s3.send).not.toHaveBeenCalled();
        });

        it('should upload a new thumbnail and not throw error even if failed to update to database', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                programId: 1,
            };
            const mockProgram = {
                id: 1,
                thumbnailUrl: null,
            };
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue({ mime: 'image/png' });
            Upload.mockImplementationOnce(() => {
                return {
                    done: jest.fn().mockResolvedValue({
                        Location: undefined,
                    }),
                };
            });

            await ProgramService.uploadThumbnail(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(mockData.programId);
            expect(sharp).toHaveBeenCalledWith(mockData.file.buffer);
            expect(Upload).toHaveBeenCalledTimes(1);
            expect(Program.update).not.toHaveBeenCalled();
            expect(s3.send).not.toHaveBeenCalled();
        });

        it('should upload a new thumbnail and delete the old one if it exists', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                programId: 1,
            };
            const mockProgram = {
                id: 1,
                thumbnailUrl: 'https://my-bucket.com/images/old-photo.webp',
            };
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue({ mime: 'image/jpeg' });

            await ProgramService.uploadThumbnail(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(mockData.programId);
            expect(s3.send).toHaveBeenCalledTimes(1);
            expect(DeleteObjectCommand).toHaveBeenCalledTimes(1);
            expect(Program.update).toHaveBeenCalledWith(
                {
                    thumbnailUrl: expect.any(String),
                },
                { where: { id: mockData.programId } },
            );
        });

        it('should throw a 400 error if no file is provided', async () => {
            const mockData = { file: null, programId: 1 };

            await expect(
                ProgramService.uploadThumbnail(mockData),
            ).rejects.toThrow(
                new HTTPError(400, 'Validation error.', [
                    {
                        message: '"thumbnail" is empty',
                        context: { key: 'thumbnail', value: null },
                    },
                ]),
            );
        });

        it('should throw a 404 error if the program is not found', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                programId: 999,
            };
            Program.findByPk.mockResolvedValue(null);

            await expect(
                ProgramService.uploadThumbnail(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Program with "programId" does not exist',
                        context: { key: 'programId', value: 999 },
                    },
                ]),
            );
        });

        it('should throw a 415 error for an unsupported file type', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                programId: 1,
            };
            const mockProgram = { id: 1, thumbnailUrl: null };
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue({ mime: 'application/pdf' });

            await expect(
                ProgramService.uploadThumbnail(mockData),
            ).rejects.toThrow(
                new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message:
                            'File MIME type must be "image/jpeg", "image/png", or "image/webp"',
                        context: {
                            key: 'File MIME Type',
                            value: 'application/pdf',
                        },
                    },
                ]),
            );
        });

        it('should throw a 415 error if file type cannot be determined', async () => {
            const mockData = {
                file: { buffer: 'mock-buffer' },
                programId: 1,
            };
            const mockProgram = { id: 1, thumbnailUrl: null };
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue(undefined);

            await expect(
                ProgramService.uploadThumbnail(mockData),
            ).rejects.toThrow(new HTTPError(415, 'Unsupported Media Type.'));
        });
    });

    describe('getManyModules Tests', () => {
        it('should return modules and pagination data with all default query parameter value', async () => {
            const mockData = {
                page: 1,
                limit: 10,
                sort: 'id',
                programId: 1,
            };
            const mockProgram = {
                course: {
                    id: 1,
                    modules: [
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                    ],
                },
            };
            const mockCountModule = 20;
            Program.findByPk.mockResolvedValue(mockProgram);
            CourseModule.count.mockResolvedValue(mockCountModule);
            const mockResult = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 20,
                    currentPage: 1,
                    totalPages: 2,
                    nextPage: 2,
                    prevPage: null,
                },
                modules: mockProgram.course.modules,
            };

            const result = await ProgramService.getManyModules(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.count).toHaveBeenCalledWith({
                where: {
                    courseId: 1,
                },
            });
            expect(result).toEqual(mockResult);
        });

        it('should return modules and pagination data with sort by createdAt descending order', async () => {
            const mockData = {
                page: 2,
                limit: 10,
                sort: '-createdAt',
                programId: 1,
            };
            const mockProgram = {
                course: {
                    id: 1,
                    modules: [
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                        { dummy: 'object' },
                    ],
                },
            };
            const mockCountModule = 20;
            Program.findByPk.mockResolvedValue(mockProgram);
            CourseModule.count.mockResolvedValue(mockCountModule);
            const mockResult = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 20,
                    currentPage: 2,
                    totalPages: 2,
                    nextPage: null,
                    prevPage: 1,
                },
                modules: mockProgram.course.modules,
            };

            const result = await ProgramService.getManyModules(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.count).toHaveBeenCalledWith({
                where: {
                    courseId: 1,
                },
            });
            expect(result).toEqual(mockResult);
        });

        it('should return empty modules and pagination data with page out of bound', async () => {
            const mockData = {
                page: 100,
                limit: 10,
                sort: '-createdAt',
                programId: 1,
            };
            const mockProgram = {
                course: {
                    id: 1,
                    modules: [],
                },
            };
            const mockCountModule = 20;
            Program.findByPk.mockResolvedValue(mockProgram);
            CourseModule.count.mockResolvedValue(mockCountModule);
            const mockResult = {
                pagination: {
                    currentRecords: 0,
                    totalRecords: 20,
                    currentPage: 100,
                    totalPages: 2,
                    nextPage: null,
                    prevPage: null,
                },
                modules: mockProgram.course.modules,
            };

            const result = await ProgramService.getManyModules(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.count).toHaveBeenCalledWith({
                where: {
                    courseId: 1,
                },
            });
            expect(result).toEqual(mockResult);
        });

        it('should return 404 error if the program is not found', async () => {
            const mockData = {
                page: 1,
                limit: 10,
                sort: 'id',
                programId: 404,
            };
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Program with "programId" does not exist',
                    context: {
                        key: 'programId',
                        value: mockData.programId,
                    },
                },
            ]);
            Program.findByPk.mockResolvedValue(null);

            expect(ProgramService.getManyModules(mockData)).rejects.toThrow(
                mockError,
            );
            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
        });
    });

    describe('getOneModule Tests', () => {
        it('should return module data', async () => {
            const mockData = {
                programId: 1,
                moduleId: 1,
            };
            const mockProgram = {
                id: 1,
                course: {
                    id: 1,
                    modules: [{ dummy: 'module' }],
                },
            };
            Program.findByPk.mockResolvedValue(mockProgram);

            const result = await ProgramService.getOneModule(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(result).toEqual(mockProgram.course.modules[0]);
        });

        it('should throw 404 if program is not found', async () => {
            const mockData = {
                programId: 404,
                moduleId: 1,
            };
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Program with "programId" does not exist',
                    context: {
                        key: 'programId',
                        value: mockData.programId,
                    },
                },
            ]);
            Program.findByPk.mockResolvedValue(null);

            await expect(ProgramService.getOneModule(mockData)).rejects.toThrow(
                mockError,
            );
            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
        });

        it('should throw 404 if module is not found', async () => {
            const mockData = {
                programId: 1,
                moduleId: 404,
            };
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Module with "moduleId" does not exist',
                    context: {
                        key: 'moduleId',
                        value: mockData.moduleId,
                    },
                },
            ]);
            const mockProgram = {
                id: 1,
            };
            Program.findByPk.mockResolvedValue(mockProgram);

            await expect(ProgramService.getOneModule(mockData)).rejects.toThrow(
                mockError,
            );
            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
        });
    });

    describe('createModule Tests', () => {
        it('should create a new module', async () => {
            const mockData = {
                title: 'ABC',
                youtubeUrl: 'https://youtube.com/url',
                programId: 1,
            };
            const mockProgram = {
                course: {
                    id: 1,
                },
            };
            const mockModule = {
                id: 1,
                title: 'ABC',
                youtubeUrl: 'https://youtube.com/url',
                markdownUrl: null,
                materialUrl: null,
                updatedAt: 'NOW',
                createdAt: 'NOW',
                deletedAt: null,
            };
            Program.findByPk.mockResolvedValue(mockProgram);
            CourseModule.create.mockResolvedValue(mockModule);

            const result = await ProgramService.createModule(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.create).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(mockModule);
        });

        it('should throw 404 error if program does not exist', async () => {
            const mockData = {
                numberCode: 1,
                youtubeUrl: 'https://youtube.com/url',
                programId: 404,
            };
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Program with "programId" does not exist',
                    context: {
                        key: 'programId',
                        value: mockData.programId,
                    },
                },
            ]);

            Program.findByPk.mockResolvedValue(null);

            await expect(ProgramService.createModule(mockData)).rejects.toThrow(
                mockError,
            );
            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.create).not.toHaveBeenCalled();
        });
    });

    describe('updateOneModule Tests', () => {
        it('should update a module', async () => {
            const mockData = {
                programId: 1,
                moduleId: 1,
                updateData: {
                    numberCode: 2,
                    youtubeUrl: 'http://youtube.com/url',
                },
            };
            const mockProgram = {
                id: 1,
                course: {
                    id: 1,
                },
            };
            const mockModuleRows = [
                {
                    id: 1,
                    title: 'ABC',
                    materialUrl: null,
                    markdownUrl: null,
                    youtubeUrl: 'http://youtube.com/url',
                    updatedAt: 'NOW',
                    createdAt: 'NOW',
                    deletedAt: null,
                },
            ];
            Program.findByPk.mockResolvedValue(mockProgram);
            CourseModule.update.mockResolvedValue([1, mockModuleRows]);

            const result = await ProgramService.updateOneModule(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.update).toHaveBeenCalledWith(
                mockData.updateData,
                expect.any(Object),
            );
            expect(result).toEqual(expect.objectContaining(mockModuleRows[0]));
        });

        it('should throw 404 error when program does not exist', async () => {
            const mockData = {
                programId: 404,
                moduleId: 1,
                updateData: {
                    numberCode: 2,
                    youtubeUrl: 'http://youtube.com/url',
                },
            };
            Program.findByPk.mockResolvedValue(null);

            await expect(
                ProgramService.updateOneModule(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Program with "programId" does not exist',
                        context: {
                            key: 'programId',
                            value: mockData.programId,
                        },
                    },
                ]),
            );

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.update).not.toHaveBeenCalled();
        });

        it('should throw 404 error when module does not exist', async () => {
            const mockData = {
                programId: 1,
                moduleId: 404,
                updateData: {
                    numberCode: 2,
                    youtubeUrl: 'http://youtube.com/url',
                },
            };
            const mockProgram = {
                id: 1,
            };
            Program.findByPk.mockResolvedValue(mockProgram);

            await expect(
                ProgramService.updateOneModule(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Module with "moduleId" does not exist',
                        context: {
                            key: 'moduleId',
                            value: mockData.moduleId,
                        },
                    },
                ]),
            );

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteOneModule Tests', () => {
        it('should delete a module', async () => {
            const mockData = {
                programId: 1,
                moduleId: 1,
            };
            const mockProgram = {
                id: 1,
                course: {
                    id: 1,
                    modules: [
                        {
                            id: 1,
                        },
                    ],
                },
            };
            Program.findByPk.mockResolvedValue(mockProgram);
            CourseModule.destroy.mockResolvedValue();

            await expect(
                ProgramService.deleteOneModule(mockData),
            ).resolves.not.toThrow();
            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.destroy).toHaveBeenCalledWith({
                where: { id: mockData.moduleId },
            });
        });

        it('should throw 404 when program does not exist', async () => {
            const mockData = {
                programId: 404,
                moduleId: 1,
            };
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Program with "programId" does not exist',
                    context: {
                        key: 'programId',
                        value: mockData.programId,
                    },
                },
            ]);
            Program.findByPk.mockResolvedValue(null);

            await expect(
                ProgramService.deleteOneModule(mockData),
            ).rejects.toThrow(mockError);
            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.destroy).not.toHaveBeenCalled();
        });

        it('should throw 404 when module does not exist', async () => {
            const mockData = {
                programId: 1,
                moduleId: 404,
            };
            const mockProgram = { id: 1 };
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Module with "moduleId" does not exist',
                    context: {
                        key: 'moduleId',
                        value: mockData.moduleId,
                    },
                },
            ]);
            Program.findByPk.mockResolvedValue(mockProgram);

            await expect(
                ProgramService.deleteOneModule(mockData),
            ).rejects.toThrow(mockError);
            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(CourseModule.destroy).not.toHaveBeenCalled();
        });
    });

    describe('uploadMaterial Tests', () => {
        const mockData = {
            file: { buffer: 'mock-buffer' },
            programId: 1,
            moduleId: 1,
        };

        const mockProgram = {
            id: 1,
            course: {
                id: 1,
                modules: [
                    {
                        id: 1,
                        materialUrl: null,
                    },
                ],
            },
        };

        it('should upload a new material and update the module record', async () => {
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue({
                ext: 'pdf',
                mime: 'application/pdf',
            });
            Upload.mockImplementation(() => {
                return {
                    done: jest.fn().mockResolvedValue({
                        Location:
                            'https://mock-s3-location.com/new-material.pdf',
                    }),
                };
            });

            const result = await ProgramService.uploadMaterial(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(Upload).toHaveBeenCalledTimes(1);
            expect(CourseModule.update).toHaveBeenCalledWith(
                {
                    materialUrl: expect.any(String),
                },
                { where: { id: mockData.moduleId } },
            );
            expect(s3.send).not.toHaveBeenCalled();
            expect(result).toEqual({
                materialUrl: expect.any(String),
            });
        });

        it('should upload a new material and delete the old one', async () => {
            const programWithMaterial = {
                ...mockProgram,
                course: {
                    ...mockProgram.course,
                    modules: [
                        {
                            id: 1,
                            materialUrl:
                                'https://my-bucket.com/documents/programs/old-material.pdf',
                        },
                    ],
                },
            };
            Program.findByPk.mockResolvedValue(programWithMaterial);
            fromBuffer.mockResolvedValue({
                ext: 'pdf',
                mime: 'application/pdf',
            });

            await ProgramService.uploadMaterial(mockData);

            expect(s3.send).toHaveBeenCalledTimes(1);
            expect(DeleteObjectCommand).toHaveBeenCalledWith({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: 'documents/programs/old-material.pdf',
            });
        });

        it('should not throw an error if S3 location is not returned', async () => {
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue({
                ext: 'pdf',
                mime: 'application/pdf',
            });
            Upload.mockImplementationOnce(() => {
                return {
                    done: jest.fn().mockResolvedValue({ Location: undefined }),
                };
            });

            await ProgramService.uploadMaterial(mockData);

            expect(CourseModule.update).not.toHaveBeenCalled();
        });

        it('should throw a 400 error if no file is provided', async () => {
            await expect(
                ProgramService.uploadMaterial({ ...mockData, file: null }),
            ).rejects.toThrow(
                new HTTPError(400, 'Validation error.', [
                    {
                        message: '"material" is empty',
                        context: { key: 'material', value: null },
                    },
                ]),
            );
        });

        it('should throw a 404 error if the program is not found', async () => {
            Program.findByPk.mockResolvedValue(null);
            await expect(
                ProgramService.uploadMaterial(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Program with "programId" does not exist',
                        context: {
                            key: 'programId',
                            value: mockData.programId,
                        },
                    },
                ]),
            );
        });

        it('should throw a 404 error if the module is not found', async () => {
            Program.findByPk.mockResolvedValue({
                ...mockProgram,
                course: null,
            });
            await expect(
                ProgramService.uploadMaterial(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Module with "moduleId" does not exist',
                        context: { key: 'moduleId', value: mockData.moduleId },
                    },
                ]),
            );
        });

        it('should throw a 415 error for an unsupported file type', async () => {
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue({
                mime: 'application/x-msdos-program',
            });

            await expect(
                ProgramService.uploadMaterial(mockData),
            ).rejects.toThrow(
                new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message: expect.stringContaining(
                            'File MIME type must be',
                        ),
                        context: {
                            key: 'File MIME Type',
                            value: 'application/x-msdos-program',
                        },
                    },
                ]),
            );
        });

        it('should throw a 415 error if file type cannot be determined', async () => {
            Program.findByPk.mockResolvedValue(mockProgram);
            fromBuffer.mockResolvedValue(null);

            await expect(
                ProgramService.uploadMaterial(mockData),
            ).rejects.toThrow(
                new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message: expect.stringContaining(
                            'File MIME type must be',
                        ),
                        context: {
                            key: 'File MIME Type',
                            value: null,
                        },
                    },
                ]),
            );
        });
    });

    describe('uploadTextMaterial Tests', () => {
        const mockData = {
            file: { buffer: 'mock-text-buffer' },
            programId: 1,
            moduleId: 1,
        };

        const mockProgram = {
            id: 1,
            course: {
                id: 1,
                modules: [
                    {
                        id: 1,
                        markdownUrl: null,
                    },
                ],
            },
        };

        beforeEach(() => {
            Program.findByPk.mockResolvedValue(mockProgram);
        });

        it('should upload a new markdown material and update the module record', async () => {
            Program.findByPk.mockResolvedValue(mockProgram);
            Upload.mockImplementation(() => {
                return {
                    done: jest.fn().mockResolvedValue({
                        Location:
                            'https://mock-s3-location.com/new-markdown.md',
                    }),
                };
            });

            const result = await ProgramService.uploadTextMaterial(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(Upload).toHaveBeenCalledTimes(1);
            expect(CourseModule.update).toHaveBeenCalledWith(
                {
                    markdownUrl: expect.any(String),
                },
                { where: { id: mockData.moduleId } },
            );
            expect(s3.send).not.toHaveBeenCalled();
            expect(result).toEqual({
                markdownUrl: expect.any(String),
            });
        });

        it('should upload a new markdown material and not throw error even if failed to update to database', async () => {
            Program.findByPk.mockResolvedValue(mockProgram);
            Upload.mockImplementationOnce(() => {
                return {
                    done: jest.fn().mockResolvedValue({
                        Location: undefined,
                    }),
                };
            });

            await ProgramService.uploadTextMaterial(mockData);

            expect(Program.findByPk).toHaveBeenCalledWith(
                mockData.programId,
                expect.any(Object),
            );
            expect(Upload).toHaveBeenCalledTimes(1);
            expect(CourseModule.update).not.toHaveBeenCalled();
            expect(s3.send).not.toHaveBeenCalled();
        });

        it('should upload a new markdown material and delete the old one if it exists', async () => {
            const programWithMarkdown = {
                ...mockProgram,
                course: {
                    ...mockProgram.course,
                    modules: [
                        {
                            id: 1,
                            markdownUrl:
                                'https://my-bucket.com/documents/programs/old-markdown.md',
                        },
                    ],
                },
            };
            Program.findByPk.mockResolvedValue(programWithMarkdown);

            await ProgramService.uploadTextMaterial(mockData);

            expect(s3.send).toHaveBeenCalledTimes(1);
            expect(DeleteObjectCommand).toHaveBeenCalledWith({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: 'documents/programs/old-markdown.md',
            });
        });

        it('should throw a 400 error if no file is provided', async () => {
            await expect(
                ProgramService.uploadTextMaterial({ ...mockData, file: null }),
            ).rejects.toThrow(
                new HTTPError(400, 'Validation error.', [
                    {
                        message: '"text" is empty',
                        context: { key: 'text', value: null },
                    },
                ]),
            );
        });

        it('should throw a 404 error if the program is not found', async () => {
            Program.findByPk.mockResolvedValue(null);
            await expect(
                ProgramService.uploadTextMaterial(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Program with "programId" does not exist',
                        context: {
                            key: 'programId',
                            value: mockData.programId,
                        },
                    },
                ]),
            );
        });

        it('should throw a 404 error if the module is not found', async () => {
            Program.findByPk.mockResolvedValue({
                ...mockProgram,
                course: null,
            });
            await expect(
                ProgramService.uploadTextMaterial(mockData),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message: 'Module with "moduleId" doesを起こすnot exist',
                        context: { key: 'moduleId', value: mockData.moduleId },
                    },
                ]),
            );
        });
    });
});
