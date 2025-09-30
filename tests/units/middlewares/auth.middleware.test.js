/* eslint-disable no-undef */
jest.mock('../../../src/utils/jwtHelper');
jest.mock('../../../src/configs/redis');
jest.mock('../../../src/validations/validator');
jest.mock('../../../src/db/models');
const {
    authenticate,
    authorize,
    validatePathParameterId,
    authorizeProgramDetails,
} = require('../../../src/middlewares/auth.middleware');
const { verify } = require('../../../src/utils/jwtHelper');
const { redisClient } = require('../../../src/configs/redis');
const HTTPError = require('../../../src/utils/httpError');
const { validateId } = require('../../../src/validations/validator');
const { Enrollment } = require('../../../src/db/models');
const { Op } = require('sequelize');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Authentication Middleware Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            tokenPayload: {},
            params: {},
            query: {},
        };
        res = mockRes();
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('authenticate Tests', () => {
        it('should call next without error and attach token payload to the req object with valid JWT token', async () => {
            req.headers.authorization = 'Bearer jwt-access-token';
            const mockToken = 'jwt-access-token';
            const mockDecoded = {
                sub: 1,
                jti: 'mock-jti-string',
            };

            verify.mockReturnValue(mockDecoded);
            redisClient.get.mockResolvedValue(null);

            await authenticate(req, res, next);

            expect(verify).toHaveBeenCalledWith(mockToken);
            expect(req).toHaveProperty(
                'tokenPayload',
                expect.objectContaining(mockDecoded),
            );
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with error when there is no access token', async () => {
            const mockToken = null;
            const mockDecoded = false;
            const mockError = new HTTPError(401, 'Unauthorized.', [
                {
                    message: 'Invalid or expired token.',
                    context: { key: 'request.headers.authorization' },
                },
            ]);

            verify.mockReturnValue(mockDecoded);

            await authenticate(req, res, next);

            expect(verify).toHaveBeenCalledWith(mockToken);
            expect(redisClient.get).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(mockError);
        });

        it('should call next with error when token is invalid', async () => {
            req.headers.authorization = 'Bearer invalid-token';
            const mockToken = 'invalid-token';
            const mockDecoded = false;
            const mockError = new HTTPError(401, 'Unauthorized.', [
                {
                    message: 'Invalid or expired token.',
                    context: { key: 'request.headers.authorization' },
                },
            ]);

            verify.mockReturnValue(mockDecoded);

            await authenticate(req, res, next);

            expect(verify).toHaveBeenCalledWith(mockToken);
            expect(redisClient.get).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(mockError);
        });

        it('should call next with error when token has been revoked', async () => {
            req.headers.authorization = 'Bearer revoked-token';
            const mockToken = 'revoked-token';
            const mockDecoded = {
                sub: 1,
                jti: 'mock-jti-string',
            };
            const mockError = new HTTPError(401, 'Unauthorized.', [
                {
                    message: 'Invalid or expired token.',
                    context: { key: 'request.headers.authorization' },
                },
            ]);

            verify.mockReturnValue(mockDecoded);
            redisClient.get.mockResolvedValue('some-datetime-string');

            await authenticate(req, res, next);

            expect(verify).toHaveBeenCalledWith(mockToken);
            expect(redisClient.get).toHaveBeenCalledWith(
                `user:${mockDecoded.sub}:JWT:${mockDecoded.jti}:logoutAt`,
            );
            expect(next).toHaveBeenCalledWith(mockError);
        });
    });

    describe('authorize Tests', () => {
        it('should call next without error when admin access', async () => {
            req.tokenPayload = { admin: true };
            const mockOptions = { rules: ['admin'] };

            await authorize(mockOptions)(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with error when user is not admin', async () => {
            req.tokenPayload = { admin: false };
            const mockOptions = { rules: ['admin'] };

            await authorize(mockOptions)(req, res, next);

            expect(next).toHaveBeenCalledWith(
                new HTTPError(403, 'Forbidden.', [
                    {
                        message:
                            'You do not have the necessary permissions to access this resource.',
                        context: {
                            key: 'role',
                            value: 'User',
                        },
                    },
                ]),
            );
        });

        it('should call next without error when user access the their own resource by request parameter', async () => {
            req.tokenPayload = { sub: 1, admin: false };
            req.params = { userId: '1' };
            const mockOptions = { rules: ['self', 'admin'] };

            await authorize(mockOptions)(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with error when user access the resource not theirs by request query', async () => {
            req.tokenPayload = { sub: 1, admin: false };
            req.query = { userId: '2' };
            const mockOptions = { rules: ['self', 'admin'] };

            await authorize(mockOptions)(req, res, next);

            expect(next).toHaveBeenCalledWith(
                new HTTPError(403, 'Forbidden.', [
                    {
                        message:
                            'You do not have the necessary permissions to access this resource.',
                        context: {
                            key: 'role',
                            value: 'User',
                        },
                    },
                ]),
            );
        });

        it('should call next without error when direct resource ownership check', async () => {
            const mockOptions = {
                rules: ['self', 'admin'],
                model: Enrollment,
                param: 'enrollmentId',
                ownerForeignKey: 'userId',
            };

            req.tokenPayload = {
                sub: 1,
                admin: false,
            };

            req.params = {
                enrollmentId: '1',
            };

            const mockResource = {
                userId: 1,
            };

            Enrollment.findByPk.mockResolvedValue(mockResource);

            await authorize(mockOptions)(req, res, next);

            expect(Enrollment.findByPk).toHaveBeenCalledWith(parseInt('1', 10));
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with error when resource not found', async () => {
            const mockOptions = {
                rules: ['self', 'admin'],
                model: Enrollment,
                param: 'enrollmentId',
                ownerForeignKey: 'userId',
            };

            req.tokenPayload = {
                sub: 1,
                admin: false,
            };

            req.params = {
                enrollmentId: '404',
            };

            const mockError = new HTTPError(404, 'Resource not found.', {
                message: 'Enrollment with "enrollmentId" does not exist',
                context: {
                    key: 'enrollmentId',
                    value: '404',
                },
            });

            Enrollment.findByPk.mockResolvedValue(null);

            await authorize(mockOptions)(req, res, next);

            expect(Enrollment.findByPk).toHaveBeenCalledWith(
                parseInt('404', 10),
            );
            expect(next).toHaveBeenCalledWith(mockError);
        });

        it('should call next with error when user does not own the resource', async () => {
            const mockOptions = {
                rules: ['self', 'admin'],
                model: Enrollment,
                param: 'enrollmentId',
                ownerForeignKey: 'userId',
            };

            req.tokenPayload = {
                sub: 1,
                admin: false,
            };

            req.params = {
                enrollmentId: '1',
            };

            const mockResource = {
                userId: 2,
            };

            const mockError = new HTTPError(403, 'Forbidden.', [
                {
                    message:
                        'You do not have the necessary permissions to access this resource.',
                    context: {
                        key: 'role',
                        value: 'User',
                    },
                },
            ]);

            Enrollment.findByPk.mockResolvedValue(mockResource);

            await authorize(mockOptions)(req, res, next);

            expect(Enrollment.findByPk).toHaveBeenCalledWith(parseInt('1', 10));
            expect(next).toHaveBeenCalledWith(mockError);
        });
    });

    describe('validatePathParameterId Tests', () => {
        it('should call next without error', () => {
            req.params = { userId: 1 };
            const mockParamName = 'userId';
            validateId.mockReturnValue({ error: null });

            validatePathParameterId(mockParamName)(req, res, next);

            expect(validateId).toHaveBeenCalledWith(req.params.userId);
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with error when id is invalid', () => {
            req.params = { userId: 'abc' };
            const mockParamName = 'userId';
            const mockError = new Error();
            validateId.mockReturnValue({ error: mockError });

            validatePathParameterId(mockParamName)(req, res, next);

            expect(validateId).toHaveBeenCalledWith(req.params.userId);
            expect(next).toHaveBeenCalledWith(mockError);
        });
    });

    describe('authorizeProgramDetails Tests', () => {
        it('should call next without error with admin access', async () => {
            req.tokenPayload = { admin: true };
            await authorizeProgramDetails(req, res, next);
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next without error with enrolled user access', async () => {
            req.tokenPayload = {
                admin: false,
                sub: 1,
            };
            req.params = {
                programId: '1',
            };
            const mockEnrollment = { id: 1 };

            Enrollment.findOne.mockResolvedValue(mockEnrollment);

            await authorizeProgramDetails(req, res, next);

            expect(Enrollment.findOne).toHaveBeenCalledWith({
                where: {
                    [Op.and]: [
                        {
                            programId: 1,
                        },
                        {
                            userId: 1,
                        },
                        {
                            status: {
                                [Op.ne]: 'Unpaid',
                            },
                        },
                    ],
                },
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with error with forbidden access', async () => {
            req.tokenPayload = {
                admin: false,
                sub: 1,
            };
            req.params = {
                programId: '1',
            };
            const mockError = new HTTPError(403, 'Forbidden.', [
                {
                    message:
                        'You do not have the necessary permissions to access this resource.',
                    context: {
                        key: 'role',
                        value: 'User',
                    },
                },
            ]);

            Enrollment.findOne.mockResolvedValue(null);

            await authorizeProgramDetails(req, res, next);

            expect(Enrollment.findOne).toHaveBeenCalledWith({
                where: {
                    [Op.and]: [
                        {
                            programId: 1,
                        },
                        {
                            userId: 1,
                        },
                        {
                            status: {
                                [Op.ne]: 'Unpaid',
                            },
                        },
                    ],
                },
            });
            expect(next).toHaveBeenCalledWith(mockError);
        });
    });
});
