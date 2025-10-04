const router = require('express').Router();
const EnrollmentController = require('../controllers/enrollment.controller');
const {
    authenticate,
    authorize,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');
const { requireJsonContent } = require('../middlewares/contentType.middleware');
const { Enrollment } = require('../db/models');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], requireUserIdQuery: true }),
    EnrollmentController.getAll,
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
    EnrollmentController.getById,
);
router.post('/', authenticate, requireJsonContent, EnrollmentController.create);

module.exports = router;
