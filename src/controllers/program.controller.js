const ProgramService = require('../services/program.service.js');
const { validateProgramQuery } = require('../validations/validator');

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
};
