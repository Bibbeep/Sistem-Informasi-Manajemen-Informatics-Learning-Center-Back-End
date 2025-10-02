/* eslint-disable no-undef */
jest.mock('../../../src/validations/validator');
jest.mock('../../../src/services/program.service');
const {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    uploadThumbnail,
    getAllModules,
    getModuleById,
    createModule,
    updateModuleById,
    deleteModuleById,
} = require('../../../src/controllers/program.controller');
const {
    validateProgramQuery,
    validateProgram,
    validateUpdateProgramData,
    validateModuleQuery,
    validateModule,
    validateUpdateModuleData,
} = require('../../../src/validations/validator');
const ProgramService = require('../../../src/services/program.service');
const HTTPError = require('../../../src/utils/httpError');
const { ValidationError } = require('joi');

describe('Program Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            tokenPayload: {},
            params: {},
            query: {},
            body: {},
            file: {},
        };

        res = {
            status: jest.fn().mockReturnThis?.() || { json: jest.fn() },
            json: jest.fn(),
        };

        res.status = jest.fn(() => {
            return res;
        });

        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll Tests', () => {
        it('should sends 200 on success and does not call next', async () => {
            const mockValue = {
                limit: 10,
                page: 1,
                sort: 'id',
                type: 'all',
                'price.gte': 0,
            };

            const mockPagination = {
                currentRecords: 10,
                totalRecords: 100,
                currentPage: 1,
                totalPages: 10,
                nextPage: 2,
                prevPage: null,
            };

            const mockPrograms = [
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

            validateProgramQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            ProgramService.getMany.mockResolvedValue({
                pagination: mockPagination,
                programs: mockPrograms,
            });

            await getAll(req, res, next);

            expect(validateProgramQuery).toHaveBeenCalledWith(req.query);
            expect(ProgramService.getMany).toHaveBeenCalledWith(mockValue);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all programs.',
                    data: {
                        programs: expect.any(Array),
                    },
                    pagination: mockPagination,
                    errors: null,
                }),
            );
        });

        it('should calls next with Joi.ValidationError when validation fails', async () => {
            req.query = {
                limit: 'abc',
                page: true,
                sort: '+updatedAt',
                type: 'BackEnd',
                'price.gte': -100,
            };

            const mockError = new ValidationError();
            validateProgramQuery.mockReturnValue({ error: mockError });

            await getAll(req, res, next);

            expect(validateProgramQuery).toHaveBeenCalledWith(req.query);
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getById Tests', () => {
        it('should send 200 on success and return program details', async () => {
            req.params = { programId: '1' };
            const mockProgramData = {
                id: 1,
                title: 'Test Program',
                type: 'Course',
                details: {
                    totalModules: 5,
                },
            };

            ProgramService.getOne.mockResolvedValue(mockProgramData);

            await getById(req, res, next);

            expect(ProgramService.getOne).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved a program details.',
                data: {
                    program: mockProgramData,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should forward service errors to the next middleware', async () => {
            req.params = { programId: '999' };
            const serviceError = new HTTPError(404, 'Not Found');
            ProgramService.getOne.mockRejectedValue(serviceError);

            await getById(req, res, next);

            expect(ProgramService.getOne).toHaveBeenCalledWith(999);
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('create Tests', () => {
        it('should create a new program and return 201', async () => {
            const mockProgramData = {
                title: 'New Program',
                description: 'A new program',
                availableDate: new Date().toISOString(),
                type: 'Course',
                priceIdr: 100000,
            };
            req.body = mockProgramData;
            const mockCreatedProgram = {
                id: 1,
                ...mockProgramData,
            };

            validateProgram.mockReturnValue({
                error: null,
                value: mockProgramData,
            });
            ProgramService.create.mockResolvedValue(mockCreatedProgram);

            await create(req, res, next);

            expect(validateProgram).toHaveBeenCalledWith(mockProgramData);
            expect(ProgramService.create).toHaveBeenCalledWith(mockProgramData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'Successfully created a program.',
                data: {
                    program: mockCreatedProgram,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error', async () => {
            const mockInvalidData = {
                title: 'New Program',
            };
            req.body = mockInvalidData;
            const validationError = new ValidationError();
            validateProgram.mockReturnValue({ error: validationError });

            await create(req, res, next);

            expect(validateProgram).toHaveBeenCalledWith(mockInvalidData);
            expect(next).toHaveBeenCalledWith(validationError);
            expect(ProgramService.create).not.toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should forward service errors to the next middleware', async () => {
            const mockProgramData = {
                title: 'New Program',
                description: 'A new program',
                availableDate: new Date().toISOString(),
                type: 'Course',
                priceIdr: 100000,
            };
            req.body = mockProgramData;
            const serviceError = new Error('Service Error');
            validateProgram.mockReturnValue({
                error: null,
                value: mockProgramData,
            });
            ProgramService.create.mockRejectedValue(serviceError);

            await create(req, res, next);

            expect(ProgramService.create).toHaveBeenCalledWith(mockProgramData);
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('updateById Tests', () => {
        it('should update a program and return 200', async () => {
            const mockUpdateData = {
                title: 'Updated Program',
                type: 'Course',
            };
            req.body = mockUpdateData;
            req.params = { programId: '1' };
            const mockUpdatedProgram = {
                id: 1,
                ...mockUpdateData,
            };

            validateUpdateProgramData.mockReturnValue({
                error: null,
                value: mockUpdateData,
            });
            ProgramService.updateOne.mockResolvedValue(mockUpdatedProgram);

            await updateById(req, res, next);

            expect(validateUpdateProgramData).toHaveBeenCalledWith(
                mockUpdateData,
            );
            expect(ProgramService.updateOne).toHaveBeenCalledWith({
                programId: 1,
                updateData: mockUpdateData,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Successfully updated a program.',
                data: {
                    program: mockUpdatedProgram,
                },
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with a validation error', async () => {
            const mockInvalidData = {
                title: 123,
            };
            req.body = mockInvalidData;
            const validationError = new ValidationError();
            validateUpdateProgramData.mockReturnValue({
                error: validationError,
            });

            await updateById(req, res, next);

            expect(validateUpdateProgramData).toHaveBeenCalledWith(
                mockInvalidData,
            );
            expect(next).toHaveBeenCalledWith(validationError);
            expect(ProgramService.updateOne).not.toHaveBeenCalled();
        });

        it('should forward service errors to the next middleware', async () => {
            const mockUpdateData = {
                title: 'Updated Program',
                type: 'Course',
            };
            req.body = mockUpdateData;
            req.params = { programId: '1' };
            const serviceError = new Error('Service Error');

            validateUpdateProgramData.mockReturnValue({
                error: null,
                value: mockUpdateData,
            });
            ProgramService.updateOne.mockRejectedValue(serviceError);

            await updateById(req, res, next);

            expect(ProgramService.updateOne).toHaveBeenCalledWith({
                programId: 1,
                updateData: mockUpdateData,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('deleteById Tests', () => {
        it('should delete a program and return 200', async () => {
            req.params = { programId: '1' };
            ProgramService.deleteOne.mockResolvedValue();

            await deleteById(req, res, next);

            expect(ProgramService.deleteOne).toHaveBeenCalledWith(1);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully deleted a program.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should forward service errors to the next middleware', async () => {
            req.params = { programId: '404' };
            const mockError = new Error('BOOM');
            ProgramService.deleteOne.mockRejectedValue(mockError);

            await deleteById(req, res, next);

            expect(ProgramService.deleteOne).toHaveBeenCalledWith(404);
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('uploadThumbnail Tests', () => {
        it('should upload a thumbnail and return 201', async () => {
            req.params.programId = '1';
            req.file = { buffer: 'mock-thumbnail-buffer' };
            const mockServiceResponse = {
                thumbnailUrl: 'https://example.com/new-thumbnail.webp',
            };

            ProgramService.uploadThumbnail.mockResolvedValue(
                mockServiceResponse,
            );

            await uploadThumbnail(req, res, next);

            expect(ProgramService.uploadThumbnail).toHaveBeenCalledWith({
                file: req.file,
                programId: 1,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'Successfully uploaded a program thumbnail.',
                data: mockServiceResponse,
                errors: null,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should forward service errors to next', async () => {
            req.params.programId = '1';
            req.file = { buffer: 'mock-thumbnail-buffer' };
            const serviceError = new Error('Upload failed');
            ProgramService.uploadThumbnail.mockRejectedValue(serviceError);

            await uploadThumbnail(req, res, next);

            expect(ProgramService.uploadThumbnail).toHaveBeenCalledWith({
                file: req.file,
                programId: 1,
            });
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getAllModules Tests', () => {
        it('should send 200 on success and return module data', async () => {
            const mockValue = {
                page: 1,
                limit: 10,
                sort: 'id',
            };
            req.params = { programId: '1' };
            const mockPagination = {
                currentRecords: 10,
                totalRecords: 20,
                currentPage: 1,
                totalPages: 2,
                nextPage: 2,
                prevPage: null,
            };
            const mockModules = [
                { dummy: 'module' },
                { dummy: 'module' },
                { dummy: 'module' },
                { dummy: 'module' },
                { dummy: 'module' },
                { dummy: 'module' },
                { dummy: 'module' },
                { dummy: 'module' },
                { dummy: 'module' },
                { dummy: 'module' },
            ];
            validateModuleQuery.mockReturnValue({
                error: null,
                value: mockValue,
            });
            ProgramService.getManyModules.mockResolvedValue({
                pagination: mockPagination,
                modules: mockModules,
            });

            await getAllModules(req, res, next);

            expect(validateModuleQuery).toHaveBeenLastCalledWith(req.query);
            expect(ProgramService.getManyModules).toHaveBeenCalledWith({
                ...mockValue,
                programId: 1,
            });
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved all modules.',
                    data: {
                        modules: mockModules,
                    },
                    pagination: mockPagination,
                    errors: null,
                }),
            );
        });

        it('should call next with a validation error', async () => {
            req.query = {
                page: 'invalid',
                limit: -1,
                sort: '-numberCode',
            };
            const mockError = new ValidationError();
            validateModuleQuery.mockReturnValue({ error: mockError });

            await getAllModules(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should forward service errors to next', async () => {
            req.query = {
                page: 1,
                limit: 10,
                sort: '-id',
            };
            const mockError = new Error('Boom!');
            validateModuleQuery.mockReturnValue({
                error: null,
                value: req.query,
            });
            ProgramService.getManyModules.mockRejectedValue(mockError);

            await getAllModules(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getModuleById Tests', () => {
        it('should send 200 on success and return a module data', async () => {
            req.params = {
                programId: 1,
                moduleId: 1,
            };
            const mockModule = {
                id: 1,
            };
            ProgramService.getOneModule.mockResolvedValue(mockModule);

            await getModuleById(req, res, next);

            expect(ProgramService.getOneModule).toHaveBeenCalledWith({
                programId: req.params.programId,
                moduleId: req.params.moduleId,
            });
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully retrieved module details.',
                    data: {
                        module: mockModule,
                    },
                    errors: null,
                }),
            );
        });

        it('should forward service errors to next', async () => {
            req.params = {
                programId: 1,
                moduleId: 1,
            };
            const mockError = new Error('BOOM!');
            ProgramService.getOneModule.mockRejectedValue(mockError);

            await getModuleById(req, res, next);

            expect(ProgramService.getOneModule).toHaveBeenCalledWith({
                programId: req.params.programId,
                moduleId: req.params.moduleId,
            });
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('createModule Tests', () => {
        it('should send 201 on success', async () => {
            req.body = {
                numberCode: 1,
                youtubeUrl: 'https://youtube.com/test',
            };
            req.params = { programId: '1' };
            const mockModule = {
                id: 1,
                numberCode: 1,
                youtubeUrl: 'https://youtube.com/test',
            };
            validateModule.mockReturnValue({
                error: null,
                value: req.body,
            });
            ProgramService.createModule.mockResolvedValue(mockModule);

            await createModule(req, res, next);

            expect(validateModule).toHaveBeenCalledWith(req.body);
            expect(ProgramService.createModule).toHaveBeenCalledWith({
                ...req.body,
                programId: 1,
            });
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 201,
                    message: 'Successfully created a module.',
                    data: {
                        module: mockModule,
                    },
                    errors: null,
                }),
            );
        });

        it('should call next with a validation error', async () => {
            req.body = {
                numberCode: 0.999,
                youtubeUrl: 'isaoijasjdsa',
            };
            const mockError = new ValidationError();
            validateModule.mockReturnValue({ error: mockError });

            await createModule(req, res, next);

            expect(validateModule).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should forward service errors to next', async () => {
            req.body = {
                numberCode: 1,
                youtubeUrl: 'https://youtube.com/test',
            };
            req.params = { programId: '1' };
            const mockError = new Error('Boom!');
            validateModule.mockReturnValue({
                error: null,
                value: req.body,
            });
            ProgramService.createModule.mockRejectedValue(mockError);

            await createModule(req, res, next);

            expect(validateModule).toHaveBeenCalledWith(req.body);
            expect(ProgramService.createModule).toHaveBeenCalledWith({
                ...req.body,
                programId: 1,
            });
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('updateModuleById Tests', () => {
        it('should send 200 on success', async () => {
            req.body = {
                numberCode: 2,
                youtubeUrl: 'https://youtube.com/test',
            };
            req.params = {
                programId: '1',
                moduleId: '1',
            };
            const mockValue = req.body;
            const mockModule = {
                id: 1,
                numberCode: 2,
                materialUrl: null,
                youtubeUrl: 'https://youtube.com/test',
                updatedAt: '2025-10-01T19:48:52.849Z',
                createdAt: '2025-10-01T18:30:38.255Z',
                deletedAt: null,
            };
            validateUpdateModuleData.mockReturnValue({
                error: null,
                value: mockValue,
            });
            ProgramService.updateOneModule.mockResolvedValue(mockModule);

            await updateModuleById(req, res, next);

            expect(validateUpdateModuleData).toHaveBeenCalledWith(req.body);
            expect(ProgramService.updateOneModule).toHaveBeenCalledWith({
                programId: 1,
                moduleId: 1,
                updateData: mockValue,
            });
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully updated a module.',
                    data: {
                        module: mockModule,
                    },
                    errors: null,
                }),
            );
        });

        it('should call next with a validation error', async () => {
            req.body = {
                numberCode: '101',
                youtubeUrl: 'not a uri',
            };
            req.params = {
                programId: 'abc',
                moduleId: 'def',
            };
            const mockError = new ValidationError();
            validateUpdateModuleData.mockReturnValue({ error: mockError });

            await updateModuleById(req, res, next);

            expect(validateUpdateModuleData).toHaveBeenCalledWith(req.body);
            expect(ProgramService.updateOneModule).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should forward service errors to next', async () => {
            req.body = {
                numberCode: 2,
                youtubeUrl: 'https://youtube.com/test',
            };
            req.params = {
                programId: '1',
                moduleId: '1',
            };
            const mockValue = req.body;
            const mockError = new Error('BOOM!');
            validateUpdateModuleData.mockReturnValue({
                error: null,
                value: mockValue,
            });
            ProgramService.updateOneModule.mockRejectedValue(mockError);

            await updateModuleById(req, res, next);

            expect(validateUpdateModuleData).toHaveBeenCalledWith(req.body);
            expect(ProgramService.updateOneModule).toHaveBeenCalledWith({
                programId: 1,
                moduleId: 1,
                updateData: mockValue,
            });
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('deleteModuleById Tests', () => {
        it('should send 200 on success', async () => {
            req.params = {
                programId: '1',
                moduleId: '1',
            };
            ProgramService.deleteOneModule.mockResolvedValue();

            await deleteModuleById(req, res, next);

            expect(ProgramService.deleteOneModule).toHaveBeenCalledWith({
                programId: 1,
                moduleId: 1,
            });
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 200,
                    message: 'Successfully deleted a module.',
                    data: null,
                    errors: null,
                }),
            );
        });

        it('should forward service errors to next', async () => {
            req.params = {
                programId: '404',
                moduleId: '404',
            };
            const mockError = new Error('BOOM!');
            ProgramService.deleteOneModule.mockRejectedValue(mockError);

            await deleteModuleById(req, res, next);

            expect(ProgramService.deleteOneModule).toHaveBeenCalledWith({
                programId: 404,
                moduleId: 404,
            });
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
