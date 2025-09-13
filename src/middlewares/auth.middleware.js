const HTTPError = require('../utils/httpError');
const { verify, decode } = require('../utils/jwtHelper');

module.exports = {
    authenticate: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.includes('Bearer ')
                ? req.headers.authorization.split(' ')[1]
                : null;

            if (!token || !verify(token)) {
                throw new HTTPError(401, 'Unauthorized.', [
                    {
                        message: 'Invalid or expired token.',
                        context: {
                            key: 'request.headers.authorization',
                        },
                    },
                ]);
            } else {
                const decoded = decode(token);
                req.tokenPayload = decoded;

                next();
            }
        } catch (err) {
            next(err);
        }
    },
};
