/* eslint-disable no-undef */
jest.mock('jsonwebtoken');
jest.mock('../../../src/validations/validator');
const jwt = require('jsonwebtoken');
const { sign, verify } = require('../../../src/utils/jwtHelper');
const { validateTokenPayload } = require('../../../src/validations/validator');

describe('JWT Helper Utility Unit Tests', () => {
    const originalEnv = process.env;

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(
            new Date('2025-12-05T00:00:00.000Z'),
        );
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.resetModules();
        process.env.JWT_SECRET_KEY = 'mocked-jwt-secret';
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = originalEnv;
    });

    describe('sign Tests', () => {
        it('should sign and return JWT access token', () => {
            const mockPayload = {
                sub: 1,
                admin: false,
                jti: 'mocked-jti-uuid',
            };

            const mockSignOptions = {
                expiresIn: '7d',
                audience: 'http://localhost',
                issuer: 'http://localhost',
            };
            const mockSignedJwt = 'mocked-jwt-token';

            jwt.sign.mockReturnValue(mockSignedJwt);

            const result = sign(mockPayload);

            expect(jwt.sign).toHaveBeenCalledWith(
                mockPayload,
                process.env.JWT_SECRET_KEY,
                mockSignOptions,
            );
            expect(result).toBe(mockSignedJwt);
        });
    });

    describe('verify Tests', () => {
        it('should return true if token is verified and validated', () => {
            const mockToken = 'mocked-jwt-token';
            const mockVerifyOptions = {
                audience: 'http://localhost',
                issuer: 'http://localhost',
            };
            const mockDecoded = {
                sub: 1,
                aud: 'http://localhost',
                iss: 'http://localhost',
                jti: 'mock-jti-value',
                iat: Math.floor(new Date() / 1000),
                exp: Math.floor(
                    new Date().setDate(new Date().getDate() + 7) / 1000,
                ),
            };

            jwt.verify.mockReturnValue(mockDecoded);
            validateTokenPayload.mockReturnValue({ error: false });

            const result = verify(mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(
                mockToken,
                process.env.JWT_SECRET_KEY,
                mockVerifyOptions,
            );
            expect(validateTokenPayload).toHaveBeenCalledWith(mockDecoded);
            expect(result).toBe(true);
        });

        it('should return false if token signature is invalid', () => {
            const mockToken = 'mocked-jwt-token';
            const mockVerifyOptions = {
                audience: 'http://localhost',
                issuer: 'http://localhost',
            };
            const mockError = new Error();

            jwt.verify.mockImplementation(() => {
                throw mockError;
            });

            const result = verify(mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(
                mockToken,
                process.env.JWT_SECRET_KEY,
                mockVerifyOptions,
            );
            expect(jwt.verify).toThrow(mockError);
            expect(result).toBe(false);
        });

        it('should return false if token payload is invalid', () => {
            const mockToken = 'mocked-jwt-token';
            const mockVerifyOptions = {
                audience: 'http://localhost',
                issuer: 'http://localhost',
            };
            const mockDecoded = {
                sub: 1,
                aud: 'http://localhost',
                iss: 'http://localhost',
                jti: 'mock-jti-value',
                iat: Math.floor(new Date() / 1000),
                exp: Math.floor(
                    new Date().setDate(new Date().getDate() + 7) / 1000,
                ),
            };
            const mockError = new Error();

            jwt.verify.mockReturnValue(mockDecoded);
            validateTokenPayload.mockReturnValue({ error: mockError });

            const result = verify(mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(
                mockToken,
                process.env.JWT_SECRET_KEY,
                mockVerifyOptions,
            );
            expect(validateTokenPayload).toHaveBeenCalledWith(mockDecoded);
            expect(result).toBe(false);
        });
    });
});
