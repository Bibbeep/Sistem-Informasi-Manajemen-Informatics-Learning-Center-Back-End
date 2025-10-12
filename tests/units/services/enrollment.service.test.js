/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
jest.mock('../../../src/utils/printPdf');
jest.mock('@aws-sdk/lib-storage');
const { Upload } = require('@aws-sdk/lib-storage');
const EnrollmentService = require('../../../src/services/enrollment.service');
const {
    Enrollment,
    sequelize,
    Program,
    Invoice,
    CourseModule,
    CompletedModule,
    Certificate,
} = require('../../../src/db/models');
const HTTPError = require('../../../src/utils/httpError');
const printPdf = require('../../../src/utils/printPdf');
const { faker } = require('@faker-js/faker');

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
            const mockData = { programId: 1, userId: 1, admin: true };
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
            const mockData = { programId: 1, userId: 1, admin: true };
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

        it('should throw 400 error if program is not available yet', async () => {
            const mockData = { programId: 1, userId: 1, admin: false };
            const mockProgram = {
                id: 1,
                priceIdr: 0,
                title: 'Free Program',
                type: 'Seminar',
                availableDate: faker.date.future(),
            };
            const mockError = new HTTPError(400, 'Validation error.', [
                {
                    message: 'Program with "programId" is not available yet',
                    context: {
                        key: 'availableDate',
                        value: mockProgram.availableDate,
                    },
                },
            ]);

            Program.findByPk.mockResolvedValue(mockProgram);

            await expect(EnrollmentService.create(mockData)).rejects.toThrow(
                mockError,
            );
        });

        it('should throw 404 error when program does not exist', async () => {
            const mockData = { programId: 999, userId: 1, admin: true };
            Program.findByPk.mockResolvedValue(null);

            await expect(EnrollmentService.create(mockData)).rejects.toThrow(
                HTTPError,
            );
        });

        it('should throw 409 error when enrollment for program already exist', async () => {
            const mockData = { programId: 1, userId: 1, admin: true };
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

    describe('updateOne Tests', () => {
        it('should update an enrollment and return the updated data', async () => {
            const mockPdfBuffer = Buffer.from('test-pdf');
            printPdf.mockResolvedValue(mockPdfBuffer);
            Upload.mockImplementation(() => {
                return {
                    done: () => {
                        return Promise.resolve({
                            Location:
                                'https://s3.amazonaws.com/bucket/test.pdf',
                        });
                    },
                };
            });
            Certificate.create.mockResolvedValue({
                toJSON: () => {
                    return { id: 1, title: 'Test Certificate' };
                },
            });
            const mockData = { enrollmentId: 1, status: 'Completed' };
            const mockEnrollment = {
                id: 1,
                status: 'In Progress',
                program: { type: 'Workshop' },
                user: { fullName: 'John Doe' },
            };
            const mockUpdatedRows = [
                {
                    id: 1,
                    status: 'Completed',
                    progressPercentage: 100,
                    completedAt: new Date(),
                },
            ];
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);
            Enrollment.update.mockResolvedValue([1, mockUpdatedRows]);

            const result = await EnrollmentService.updateOne(mockData);

            expect(Enrollment.update).toHaveBeenCalled();
            expect(result.status).toBe('Completed');
            expect(result.progressPercentage).toBe(100);
        });

        it('should throw 404 error if enrollment is not found', async () => {
            const mockData = { enrollmentId: 999, status: 'Completed' };
            Enrollment.findByPk.mockResolvedValue(null);

            await expect(EnrollmentService.updateOne(mockData)).rejects.toThrow(
                new HTTPError(404, 'Resource not found.'),
            );
        });

        it('should throw 400 error for unpaid enrollment', async () => {
            const mockData = { enrollmentId: 1, status: 'Completed' };
            const mockEnrollment = { id: 1, status: 'Unpaid' };
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);

            await expect(EnrollmentService.updateOne(mockData)).rejects.toThrow(
                new HTTPError(400, 'Validation error.'),
            );
        });

        it('should throw 400 error for already completed enrollment', async () => {
            const mockData = { enrollmentId: 1, status: 'Completed' };
            const mockEnrollment = { id: 1, status: 'Completed' };
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);

            await expect(EnrollmentService.updateOne(mockData)).rejects.toThrow(
                new HTTPError(400, 'Validation error.'),
            );
        });

        it('should throw 400 error for course program type', async () => {
            const mockData = { enrollmentId: 1, status: 'Completed' };
            const mockEnrollment = {
                id: 1,
                status: 'In Progress',
                program: { type: 'Course' },
            };
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);

            await expect(EnrollmentService.updateOne(mockData)).rejects.toThrow(
                new HTTPError(400, 'Validation error.'),
            );
        });
    });

    describe('deleteOne Tests', () => {
        it('should delete an enrollment successfully', async () => {
            const mockEnrollmentId = 1;
            Enrollment.findByPk.mockResolvedValue({ id: mockEnrollmentId });
            Enrollment.destroy.mockResolvedValue(1);

            await EnrollmentService.deleteOne(mockEnrollmentId);

            expect(Enrollment.findByPk).toHaveBeenCalledWith(mockEnrollmentId);
            expect(Enrollment.destroy).toHaveBeenCalledWith({
                where: { id: mockEnrollmentId },
            });
        });

        it('should throw a 404 error if enrollment is not found', async () => {
            const mockEnrollmentId = 999;
            Enrollment.findByPk.mockResolvedValue(null);

            await expect(
                EnrollmentService.deleteOne(mockEnrollmentId),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Enrollment with "enrollmentId" does not exist',
                        context: {
                            key: 'enrollmentId',
                            value: mockEnrollmentId,
                        },
                    },
                ]),
            );

            expect(Enrollment.findByPk).toHaveBeenCalledWith(mockEnrollmentId);
            expect(Enrollment.destroy).not.toHaveBeenCalled();
        });
    });

    describe('completeModule Tests', () => {
        it('should complete a module and update progress', async () => {
            const mockData = { enrollmentId: 1, courseModuleId: 1 };
            CourseModule.findByPk.mockResolvedValue({ id: 1 });
            const mockEnrollment = {
                id: 1,
                status: 'In Progress',
                program: {
                    type: 'Course',
                    course: {
                        toJSON: () => {
                            return { totalModules: 10 };
                        },
                    },
                },
                completedModules: [],
            };
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);
            CompletedModule.create.mockResolvedValue({ id: 1, ...mockData });
            Enrollment.update.mockResolvedValue([1]);

            const result = await EnrollmentService.completeModule(mockData);

            expect(result.progressPercentage).toBe('10.00');
            expect(Enrollment.update).toHaveBeenCalled();
        });

        it('should complete the final module and mark enrollment as completed', async () => {
            const mockData = { enrollmentId: 1, courseModuleId: 1 };
            CourseModule.findByPk.mockResolvedValue({ id: 1 });
            const mockEnrollment = {
                id: 1,
                status: 'In Progress',
                program: {
                    type: 'Course',
                    course: {
                        toJSON: () => {
                            return { totalModules: 1 };
                        },
                    },
                },
                completedModules: [],
                user: {
                    fullName: 'John Doe',
                },
            };
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);
            CompletedModule.create.mockResolvedValue({ id: 1, ...mockData });
            Enrollment.update.mockResolvedValue([1]);

            const result = await EnrollmentService.completeModule(mockData);

            expect(result.progressPercentage).toBe('100.00');
            expect(Enrollment.update).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'Completed' }),
                expect.any(Object),
            );
        });

        it('should throw 404 if module not found', async () => {
            const mockData = { enrollmentId: 1, courseModuleId: 999 };
            CourseModule.findByPk.mockResolvedValue(null);

            await expect(
                EnrollmentService.completeModule(mockData),
            ).rejects.toThrow(HTTPError);
        });

        it('should throw 404 if enrollment not found', async () => {
            const mockData = { enrollmentId: 999, courseModuleId: 1 };
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Enrollment with "enrollmentId" does not exist',
                    context: {
                        key: 'enrollmentId',
                        value: mockData.enrollmentId,
                    },
                },
            ]);
            CourseModule.findByPk.mockResolvedValue({ id: 1 });

            Enrollment.findByPk.mockImplementation((id, options) => {
                if (options && options.include && options.include.length > 1) {
                    return Promise.resolve(null);
                }
                return Promise.resolve({ id: 1 });
            });

            await expect(
                EnrollmentService.completeModule(mockData),
            ).rejects.toThrow(mockError);
        });

        it('should throw 400 if program is not a course', async () => {
            const mockData = { enrollmentId: 1, courseModuleId: 1 };
            CourseModule.findByPk.mockResolvedValue({ id: 1 });
            Enrollment.findByPk.mockResolvedValue({
                id: 1,
                program: { type: 'Workshop' },
            });

            await expect(
                EnrollmentService.completeModule(mockData),
            ).rejects.toThrow(HTTPError);
        });

        it('should throw 400 if enrollment is unpaid', async () => {
            const mockData = { enrollmentId: 1, courseModuleId: 1 };
            CourseModule.findByPk.mockResolvedValue({ id: 1 });
            Enrollment.findByPk.mockResolvedValue({
                id: 1,
                status: 'Unpaid',
                program: { type: 'Course' },
            });

            await expect(
                EnrollmentService.completeModule(mockData),
            ).rejects.toThrow(HTTPError);
        });

        it('should throw 409 if module is already completed', async () => {
            const mockData = { enrollmentId: 1, courseModuleId: 1 };
            CourseModule.findByPk.mockResolvedValue({ id: 1 });
            Enrollment.findByPk.mockResolvedValue({
                id: 1,
                status: 'In Progress',
                program: { type: 'Course' },
                completedModules: [{ courseModuleId: 1 }],
            });

            await expect(
                EnrollmentService.completeModule(mockData),
            ).rejects.toThrow(HTTPError);
        });
    });
});
