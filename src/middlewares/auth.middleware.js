const HTTPError = require('../utils/httpError');
const { verify } = require('../utils/jwtHelper');
const { redisClient } = require('../configs/redis');
const { validateId } = require('../validations/validator');
const { Enrollment } = require('../db/models');
const { Op } = require('sequelize');

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
    authorize: (options) => {
        const { rules, model, param, ownerForeignKey, requireUserIdQuery } =
            options;

        return async (req, res, next) => {
            try {
                const { sub: loggedInUserId, admin: isAdmin } =
                    req.tokenPayload;

                if (rules.includes('admin') && isAdmin) {
                    return next();
                }

                if (rules.includes('self')) {
                    const targetUserId = req.params.userId || req.query.userId;

                    if (
                        targetUserId &&
                        parseInt(targetUserId, 10) === loggedInUserId
                    ) {
                        return next();
                    }

                    if (requireUserIdQuery && !req.query.userId) {
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
                    }

                    if (model && param && ownerForeignKey) {
                        const resource = await model.findByPk(
                            parseInt(req.params[param], 10),
                        );

                        if (!resource) {
                            throw new HTTPError(404, 'Resource not found.', {
                                message: `${model.name} with "${param}" does not exist`,
                                context: {
                                    key: param,
                                    value: req.params[param],
                                },
                            });
                        }

                        if (resource[ownerForeignKey] === loggedInUserId) {
                            return next();
                        }
                    }
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
    validatePathParameterId: (paramName) => {
        return (req, res, next) => {
            try {
                const { error } = validateId(req.params[paramName]);

                if (error) {
                    throw error;
                }

                next();
            } catch (err) {
                next(err);
            }
        };
    },
    authorizeProgramDetails: async (req, res, next) => {
        try {
            if (req.tokenPayload.admin) {
                return next();
            }

            const programId = parseInt(req.params.programId, 10);
            const userId = req.tokenPayload.sub;

            const enrollment = await Enrollment.findOne({
                where: {
                    [Op.and]: [
                        {
                            programId,
                        },
                        {
                            userId,
                        },
                        {
                            status: {
                                [Op.ne]: 'Unpaid',
                            },
                        },
                    ],
                },
            });

            if (enrollment) {
                req.params.enrollmentId = enrollment.id;
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
    },
};
