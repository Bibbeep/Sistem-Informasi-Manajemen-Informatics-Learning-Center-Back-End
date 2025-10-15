const HTTPError = require('../utils/httpError');
const { verify } = require('../utils/jwtHelper');
const { redisClient } = require('../configs/redis');
const { validateId } = require('../validations/validator');
const { Enrollment } = require('../db/models');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @description Middleware to authenticate user by validating JWT token.
     */
    authenticate: asyncHandler(async (req, res, next) => {
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
    }),
    /**
     * @param {Object} options
     * @param {Array<'admin'|'self'>} options.rules - The authorization rules to apply.
     * @param {import('sequelize').Model} [options.model] - The Sequelize model to check for ownership directly.
     * @param {Object} [options.ownerService] - A service with a `getOwnerId` method for more complex ownership checks.
     * @param {string} [options.param] - The request parameter name containing the resource ID.
     * @param {string} [options.ownerForeignKey] - The foreign key in the model that links to the user ID.
     * @param {('required'|'prohibited')} [options.ownerQueryParam] - Whether to require or prohibit a `userId` in the query parameter for non-admin users.
     * @returns {import('express').RequestHandler}
     * @description Middleware factory to authorize user access based on rules.
     */
    authorize: (options) => {
        const {
            rules,
            model,
            param,
            ownerForeignKey,
            ownerQueryParam,
            ownerService,
        } = options;

        return asyncHandler(async (req, res, next) => {
            try {
                const { sub: loggedInUserId, admin: isAdmin } =
                    req.tokenPayload;

                if (rules.includes('admin') && isAdmin) {
                    return next();
                }

                if (rules.includes('self')) {
                    if (ownerQueryParam === 'prohibited' && req.query.userId) {
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

                    const targetUserId = req.params.userId || req.query.userId;

                    if (
                        targetUserId &&
                        parseInt(targetUserId, 10) === loggedInUserId
                    ) {
                        return next();
                    }

                    if (ownerQueryParam === 'required' && !req.query.userId) {
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
                            throw new HTTPError(404, 'Resource not found.', [
                                {
                                    message: `${model.name} with "${param}" does not exist`,
                                    context: {
                                        key: param,
                                        value: req.params[param],
                                    },
                                },
                            ]);
                        }

                        if (resource[ownerForeignKey] === loggedInUserId) {
                            return next();
                        }
                    }

                    if (ownerService && param) {
                        const resourceId = req.params[param];
                        const ownerId = await ownerService.getOwnerId(
                            parseInt(resourceId, 10),
                        );

                        if (!ownerId) {
                            throw new HTTPError(404, 'Resource not found.', [
                                {
                                    message: `${ownerService.name} with "${param}" does not exist`,
                                    context: {
                                        key: param,
                                        value: req.params[param],
                                    },
                                },
                            ]);
                        }

                        if (ownerId === loggedInUserId) {
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
        });
    },
    /**
     * @param {string} paramName - The name of the path parameter to validate.
     * @returns {import('express').RequestHandler}
     * @description Middleware factory to validate a path parameter as a positive integer ID.
     */
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
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @description Middleware to authorize access to program details.
     */
    authorizeProgramDetails: asyncHandler(async (req, res, next) => {
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
                                [Op.notIn]: ['Unpaid', 'Expired'],
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
    }),
};
