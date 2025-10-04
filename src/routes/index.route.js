const router = require('express').Router();
const swaggerUI = require('swagger-ui-express');
const { swaggerSpec, swaggerOptions } = require('../configs/swagger');
const AuthRoutes = require('./auth.route');
const UserRoutes = require('./user.route');
const FeedbackRoutes = require('./feedback.route');
const ProgramRoutes = require('./program.route');
const EnrollmentRoutes = require('./enrollment.route');

router.use('/auth', AuthRoutes);
router.use('/users', UserRoutes);
router.use('/feedbacks', FeedbackRoutes);
router.use('/programs', ProgramRoutes);
router.use('/enrollments', EnrollmentRoutes);
router.use(
    '/docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec, swaggerOptions),
);

module.exports = router;
