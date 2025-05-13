const router = require('express').Router();

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

module.exports = router;
