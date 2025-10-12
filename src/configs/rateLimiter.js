module.exports = {
    windowMs: process.env.RATE_LIMITER_WINDOW_SEC * 1000 || 60 * 1000,
    max:
        process.env.NODE_ENV !== 'production'
            ? 600
            : process.env.RATE_LIMITER_MAX_REQ || 100,
    // eslint-disable-next-line no-unused-vars
    handler: (req, res, next) => {
        return res.status(429).json({
            success: false,
            statusCode: 429,
            message: 'Too many requests.',
            data: null,
            errors: null,
        });
    },
};
