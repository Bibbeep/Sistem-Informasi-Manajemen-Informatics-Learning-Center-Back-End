const EnrollmentService = require('../services/enrollment.service');
const {
    validateEnrollmentQuery,
    validateEnrollment,
} = require('../validations/validator');

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
    getById: async (req, res, next) => {
        try {
            const enrollment = await EnrollmentService.getOne(
                parseInt(req.params.enrollmentId, 10),
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved program enrollment details.',
                data: {
                    enrollment,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    create: async (req, res, next) => {
        try {
            const { error, value } = validateEnrollment(req.body);

            if (error) {
                throw error;
            }

            const { enrollment, invoice } = await EnrollmentService.create({
                ...value,
                userId: req.tokenPayload.sub,
            });

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message:
                    'Successfully created an enrollment. Please complete the payment to access the contents.',
                data: {
                    enrollment,
                    invoice,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
