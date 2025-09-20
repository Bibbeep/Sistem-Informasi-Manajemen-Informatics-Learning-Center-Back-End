const HTTPError = require('../utils/httpError');
const { verify } = require('../utils/jwtHelper');
const { redisClient } = require('../configs/redis');

module.exports = {
    authenticate: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.includes('Bearer ')
                ? req.headers.authorization.split(' ')[1]
                : null;

            const decoded = verify(token);
            if (
                !decoded ||
                (await redisClient.get(
                    `user:${decoded.sub}:JWT:${decoded.jti}:logoutAt`,
                ))
            ) {
                throw new HTTPError(401, 'Unauthorized.', [
                    {
                        message: 'Invalid or expired token.',
                        context: {
                            key: 'request.headers.authorization',
                        },
                    },
                ]);
            } else {
                req.tokenPayload = decoded;
                next();
            }
        } catch (err) {
            next(err);
        }
    },
    authorize: (allowRule) => {
        return async (req, res, next) => {
            try {
                const isAdmin = req.tokenPayload.admin;

                if (allowRule === 'admin' && isAdmin) {
                    return next();
                }

                throw new HTTPError(403, 'Forbidden.', [
                    {
                        message:
                            'You do not have the necessary permissions to access this resource.',
                        context: {
                            key: 'role',
                            value: 'User',
                        },
                    },
                ]);
            } catch (err) {
                next(err);
            }
        };
    },
};
