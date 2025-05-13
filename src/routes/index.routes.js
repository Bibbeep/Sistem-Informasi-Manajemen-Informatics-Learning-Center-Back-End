const router = require('express').Router();
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('../configs/swagger');

router.get('/', async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Successfully accessed the API.',
            data: null,
            errors: null,
        });
    } catch (err) {
        next(err);
    }
});
router.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

module.exports = router;
