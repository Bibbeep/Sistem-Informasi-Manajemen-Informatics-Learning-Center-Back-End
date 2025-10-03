const router = require('express').Router();
const EnrollmentController = require('../controllers/enrollment.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], requireUserIdQuery: true }),
    EnrollmentController.getAll,
);

module.exports = router;
