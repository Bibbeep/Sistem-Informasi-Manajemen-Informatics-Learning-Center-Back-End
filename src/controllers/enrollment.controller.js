const EnrollmentService = require('../services/enrollment.service');
const {
    validateEnrollmentQuery,
    validateEnrollment,
    validateUpdateEnrollmentData,
    validateCompleteModule,
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
                admin: req.tokenPayload.admin,
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
    updateById: async (req, res, next) => {
        try {
            const { error, value } = validateUpdateEnrollmentData(req.body);

            if (error) {
                throw error;
            }

            const enrollment = await EnrollmentService.updateOne({
                enrollmentId: parseInt(req.params.enrollmentId, 10),
                ...value,
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully updated program enrollment details.',
                data: {
                    enrollment,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    deleteById: async (req, res, next) => {
        try {
            await EnrollmentService.deleteOne(
                parseInt(req.params.enrollmentId, 10),
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully deleted an enrollment.',
                data: null,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    completeModule: async (req, res, next) => {
        try {
            const { error, value } = validateCompleteModule(req.body);

            if (error) {
                throw error;
            }

            const { progressPercentage, completedModule } =
                await EnrollmentService.completeModule({
                    enrollmentId: parseInt(req.params.enrollmentId, 10),
                    ...value,
                });

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully completed a module.',
                data: {
                    progressPercentage,
                    completedModule,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
