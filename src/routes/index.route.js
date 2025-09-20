const router = require('express').Router();
const swaggerUI = require('swagger-ui-express');
const { swaggerSpec, swaggerOptions } = require('../configs/swagger');
const AuthRoutes = require('./auth.route');
const UserRoutes = require('./user.route');

router.use('/auth', AuthRoutes);
router.use('/users', UserRoutes);
router.use(
    '/docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec, swaggerOptions),
);

module.exports = router;
