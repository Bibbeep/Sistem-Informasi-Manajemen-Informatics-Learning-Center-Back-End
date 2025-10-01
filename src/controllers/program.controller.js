const ProgramService = require('../services/program.service.js');
const {
    validateProgramQuery,
    validateProgram,
    validateUpdateProgramData,
    validateModuleQuery,
} = require('../validations/validator');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const { error, value } = validateProgramQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, programs } =
                await ProgramService.getMany(value);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all programs.',
                data: {
                    programs,
                },
                pagination,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            const program = await ProgramService.getOne(
                parseInt(req.params.programId, 10),
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved a program details.',
                data: {
                    program,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    create: async (req, res, next) => {
        try {
            const { error, value } = validateProgram(req.body);

            if (error) {
                throw error;
            }

            const program = await ProgramService.create(value);

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully created a program.',
                data: {
                    program,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    updateById: async (req, res, next) => {
        try {
            const { error, value } = validateUpdateProgramData(req.body);

            if (error) {
                throw error;
            }

            const program = await ProgramService.updateOne({
                programId: parseInt(req.params.programId, 10),
                updateData: value,
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully updated a program.',
                data: {
                    program,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    deleteById: async (req, res, next) => {
        try {
            await ProgramService.deleteOne(parseInt(req.params.programId, 10));

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted a program.',
                data: null,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    uploadThumbnail: async (req, res, next) => {
        try {
            const data = await ProgramService.uploadThumbnail({
                file: req.file,
                programId: parseInt(req.params.programId, 10),
            });

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully uploaded a program thumbnail.',
                data,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    getAllModules: async (req, res, next) => {
        try {
            const { error, value } = validateModuleQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, modules } = await ProgramService.getManyModules(
                { ...value, programId: parseInt(req.params.programId, 10) },
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all modules.',
                data: {
                    modules,
                },
                pagination,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
