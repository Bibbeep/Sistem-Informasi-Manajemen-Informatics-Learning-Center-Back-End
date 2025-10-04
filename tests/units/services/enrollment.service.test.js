/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
const EnrollmentService = require('../../../src/services/enrollment.service');
const {
    Enrollment,
    sequelize,
    Program,
    Invoice,
} = require('../../../src/db/models');
const HTTPError = require('../../../src/utils/httpError');

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

    describe('getOne Tests', () => {
        it('should return enrollment data for Course program', async () => {
            const mockEnrollmentId = 1;
            const mockEnrollment = {
                id: 1,
                userId: 1,
                programId: 1,
                progressPercentage: 100.0,
                status: 'Completed',
                completedAt: 'NOW',
                createdAt: 'NOW',
                updatedAt: 'NOW',
                program: {
                    title: 'title',
                    type: 'Course',
                    thumbnailUrl: 'https://thumbnail.com/url',
                },
                completedModules: [
                    {
                        courseModuleId: 1,
                        completedAt: 'NOW',
                    },
                    {
                        courseModuleId: 1,
                        completedAt: 'NOW',
                    },
                    {
                        courseModuleId: 1,
                        completedAt: 'NOW',
                    },
                ],
            };
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);

            const result = await EnrollmentService.getOne(mockEnrollmentId);

            expect(Enrollment.findByPk).toHaveBeenCalledWith(
                mockEnrollmentId,
                expect.any(Object),
            );
            expect(result).toHaveProperty(
                'completedModules',
                expect.any(Array),
            );
        });

        it('should return enrollment data for non-Course program', async () => {
            const mockEnrollmentId = 1;
            const mockEnrollment = {
                id: 1,
                userId: 1,
                programId: 1,
                progressPercentage: 100.0,
                status: 'Completed',
                completedAt: 'NOW',
                createdAt: 'NOW',
                updatedAt: 'NOW',
                program: {
                    title: 'title',
                    type: 'Seminar',
                    thumbnailUrl: 'https://thumbnail.com/url',
                },
            };
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);

            const result = await EnrollmentService.getOne(mockEnrollmentId);

            expect(Enrollment.findByPk).toHaveBeenCalledWith(
                mockEnrollmentId,
                expect.any(Object),
            );
            expect(result).not.toHaveProperty(
                'completedModules',
                expect.any(Array),
            );
        });

        it('should throw 404 error when enrollment does not exist', async () => {
            const mockEnrollmentId = 404;
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Enrollment with "enrollmentId" does not exist',
                    context: {
                        key: 'enrollmentId',
                        value: mockEnrollmentId,
                    },
                },
            ]);
            Enrollment.findByPk.mockResolvedValue(null);

            await expect(
                EnrollmentService.getOne(mockEnrollmentId),
            ).rejects.toThrow(mockError);
            expect(Enrollment.findByPk).toHaveBeenCalledWith(
                mockEnrollmentId,
                expect.any(Object),
            );
        });
    });

    describe('create Tests', () => {
        it('should create a new enrollment and return enrollment and invoice data', async () => {
            const mockData = { programId: 1, userId: 1 };
            const mockProgram = {
                id: 1,
                priceIdr: 50000,
                title: 'Test Program',
                type: 'Course',
            };
            const mockEnrollment = { id: 1, ...mockData };
            const mockInvoice = { id: 1, enrollmentId: 1, amountIdr: 50000 };
            Program.findByPk.mockResolvedValue(mockProgram);
            Enrollment.findOne.mockResolvedValue(null);
            sequelize.transaction.mockImplementation(async (callback) => {
                return callback();
            });
            Enrollment.create.mockResolvedValue(mockEnrollment);
            Invoice.create.mockResolvedValue(mockInvoice);

            const result = await EnrollmentService.create(mockData);

            expect(result.enrollment).toBeDefined();
            expect(result.invoice).toBeDefined();
        });

        it('should create a new enrollment and return enrollment and invoice data for a free program', async () => {
            const mockData = { programId: 1, userId: 1 };
            const mockProgram = {
                id: 1,
                priceIdr: 0,
                title: 'Free Program',
                type: 'Seminar',
            };
            const mockEnrollment = {
                id: 1,
                ...mockData,
                status: 'In Progress',
            };
            const mockInvoice = {
                id: 1,
                enrollmentId: 1,
                amountIdr: 0,
                status: 'Verified',
            };

            Program.findByPk.mockResolvedValue(mockProgram);
            Enrollment.findOne.mockResolvedValue(null);
            sequelize.transaction.mockImplementation(async (callback) => {
                return callback();
            });
            Enrollment.create.mockResolvedValue(mockEnrollment);
            Invoice.create.mockResolvedValue(mockInvoice);

            const result = await EnrollmentService.create(mockData);

            expect(Enrollment.create).toHaveBeenCalledWith(
                {
                    programId: mockData.programId,
                    userId: mockData.userId,
                    status: 'In Progress',
                    progressPercentage: 0,
                    completedAt: null,
                },
                expect.any(Object),
            );
            expect(result.invoice.status).toBe('Verified');
        });

        it('should throw 404 error when program does not exist', async () => {
            const mockData = { programId: 999, userId: 1 };
            Program.findByPk.mockResolvedValue(null);

            await expect(EnrollmentService.create(mockData)).rejects.toThrow(
                HTTPError,
            );
        });

        it('should throw 409 error when enrollment for program already exist', async () => {
            const mockData = { programId: 1, userId: 1 };
            const mockProgram = { id: 1 };
            Program.findByPk.mockResolvedValue(mockProgram);
            Enrollment.findOne.mockResolvedValue({ id: 1 });

            await expect(EnrollmentService.create(mockData)).rejects.toThrow(
                new HTTPError(409, 'Resource conflict.', [
                    {
                        message:
                            'Enrollment for "programId" has already been made',
                        context: {
                            key: 'programId',
                            value: mockData.programId,
                        },
                    },
                ]),
            );
        });
    });
});
