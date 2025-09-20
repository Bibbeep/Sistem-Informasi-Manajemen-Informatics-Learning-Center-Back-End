/* eslint-disable no-undef */
jest.mock('../../../src/utils/jwtHelper');
jest.mock('../../../src/configs/redis');
const {
    authenticate,
    authorize,
} = require('../../../src/middlewares/auth.middleware');
const { verify } = require('../../../src/utils/jwtHelper');
const { redisClient } = require('../../../src/configs/redis');
const HTTPError = require('../../../src/utils/httpError');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Authentication Middleware Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
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
        it('should call next without error', async () => {
            req.tokenPayload = { admin: true };
            const mockAllowRule = 'admin';

            await authorize(mockAllowRule)(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with error when user is not admin', async () => {
            req.tokenPayload = { admin: false };
            const mockAllowRule = 'admin';

            await authorize(mockAllowRule)(req, res, next);

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

        it('should', async () => {
            //
        });

        it('should', async () => {
            //
        });
    });
});
