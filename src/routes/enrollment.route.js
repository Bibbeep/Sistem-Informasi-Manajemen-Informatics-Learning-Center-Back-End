const router = require('express').Router();
const EnrollmentController = require('../controllers/enrollment.controller');
const {
    authenticate,
    authorize,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');
const { requireJsonContent } = require('../middlewares/contentType.middleware');
const { Enrollment } = require('../db/models');
const asyncHandler = require('../utils/asyncHandler');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], ownerQueryParam: 'required' }),
    asyncHandler(EnrollmentController.getAll),
);
router.get(
    '/:enrollmentId',
    authenticate,
    validatePathParameterId('enrollmentId'),
    authorize({
        rules: ['self', 'admin'],
        model: Enrollment,
        param: 'enrollmentId',
        ownerForeignKey: 'userId',
        ownerQueryParam: 'prohibited',
    }),
    asyncHandler(EnrollmentController.getById),
);
router.post(
    '/',
    authenticate,
    requireJsonContent,
    asyncHandler(EnrollmentController.create),
);
router.patch(
    '/:enrollmentId',
    authenticate,
    validatePathParameterId('enrollmentId'),
    requireJsonContent,
    authorize({
        rules: ['self', 'admin'],
        model: Enrollment,
        param: 'enrollmentId',
        ownerForeignKey: 'userId',
        ownerQueryParam: 'prohibited',
    }),
    asyncHandler(EnrollmentController.updateById),
);
router.delete(
    '/:enrollmentId',
    authenticate,
    validatePathParameterId('enrollmentId'),
    authorize({ rules: ['admin'] }),
    asyncHandler(EnrollmentController.deleteById),
);
router.post(
    '/:enrollmentId/completed-modules',
    authenticate,
    validatePathParameterId('enrollmentId'),
    requireJsonContent,
    authorize({
        rules: ['self', 'admin'],
        model: Enrollment,
        param: 'enrollmentId',
        ownerForeignKey: 'userId',
        ownerQueryParam: 'prohibited',
    }),
    asyncHandler(EnrollmentController.completeModule),
);

module.exports = router;
