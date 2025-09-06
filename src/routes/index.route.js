const router = require('express').Router();
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('../configs/swagger');
const AuthRoutes = require('./auth.route');

router.use('/auth', AuthRoutes);
router.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

module.exports = router;
