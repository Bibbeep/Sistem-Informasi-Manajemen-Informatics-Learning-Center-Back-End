const HTTPError = require('../utils/httpError');

const requireJsonContent = (req, res, next) => {
    try {
        if (
            req.method === 'POST' &&
            req.headers['content-type'] !== 'application/json'
        ) {
            throw new HTTPError(415, 'Unsupported Media Type.', [
                {
                    message: 'Content-Type headers must be application/json',
                    context: {
                        key: 'Content-Type',
                        value: req.headers['content-type'] || null,
                    },
                },
            ]);
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    requireJsonContent,
};
