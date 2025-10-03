const EnrollmentService = require('../services/enrollment.service');
const { validateEnrollmentQuery } = require('../validations/validator');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const { error, value } = validateEnrollmentQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, enrollments } =
                await EnrollmentService.getMany(value);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all program enrollments.',
                data: {
                    enrollments,
                },
                pagination,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
