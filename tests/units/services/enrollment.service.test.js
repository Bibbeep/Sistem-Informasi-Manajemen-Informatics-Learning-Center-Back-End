/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
const EnrollmentService = require('../../../src/services/enrollment.service');
const { Enrollment } = require('../../../src/db/models');

describe('Enrollment Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMany Tests', () => {
        let mockRows;
        beforeEach(() => {
            mockRows = [
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    programId: 1,
                    progressPercentage: '100.00',
                    status: 'Completed',
                    completedAt: '2025-12-12T00:00:00.000Z',
                    createdAt: '2025-12-12T00:00:00.000Z',
                    updatedAt: '2025-12-12T00:00:00.000Z',
                    deletedAt: null,
                    program: {
                        title: 'Title',
                        type: 'Course',
                        thumbnailUrl: 'https://thumbnail.url/',
                    },
                },
            ];
        });

        it('should return enrollments and pagination data with all default query parameter value', async () => {
            const mockData = {
                page: 1,
                limit: 10,
                sort: 'id',
                programType: 'all',
                status: 'all',
            };
            const mockCount = 30;
            const mockResult = {
                enrollments: expect.any(Array),
                pagination: expect.any(Object),
            };
            Enrollment.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await EnrollmentService.getMany(mockData);

            expect(Enrollment.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(mockResult);
        });

        it('should return enrollments and pagination data with query parameter values', async () => {
            const mockData = {
                page: 2,
                limit: 10,
                sort: '-createdAt',
                programType: 'course',
                status: 'in progress',
                userId: 1,
                programId: 1,
            };
            const mockCount = 30;
            const mockResult = {
                enrollments: expect.any(Array),
                pagination: expect.any(Object),
            };
            Enrollment.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await EnrollmentService.getMany(mockData);

            expect(Enrollment.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(mockResult);
        });

        it('should return empty enrollment', async () => {
            const mockData = {
                page: 3,
                limit: 10,
                sort: '-createdAt',
                programType: 'course',
                status: 'in progress',
                userId: 1,
                programId: 1,
            };
            const mockCount = 0;
            const mockResult = {
                enrollments: expect.any(Array),
                pagination: expect.any(Object),
            };
            Enrollment.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: [],
            });

            const result = await EnrollmentService.getMany(mockData);

            expect(Enrollment.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(mockResult);
        });
    });
});
