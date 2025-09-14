/* eslint-disable no-undef */
const {
    validateRegister,
    validateLogin,
    validateTokenPayload,
} = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('Authentication Validation Unit Tests', () => {
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(
            new Date('2025-12-12T00:00:00.000Z'),
        );
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('validateRegister Tests', () => {
        it('should pass validation with valid register data', () => {
            const validData = {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                password: 'validPassword123',
            };

            const result = validateRegister(validData);

            expect(result.error).toBeUndefined();
            expect(result.value).toEqual(validData);
        });

        it('should fail validation when fullName is missing', () => {
            const invalidData = {
                email: 'john.doe@example.com',
                password: 'validPassword123',
            };

            const result = validateRegister(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details[0].path).toContain('fullName');
            expect(result.error.details[0].type).toBe('any.required');
        });

        it('should fail validation with invalid email format', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'invalid-email',
                password: 'validPassword123',
            };

            const result = validateRegister(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details[0].path).toContain('email');
            expect(result.error.details[0].type).toBe('string.email');
        });

        it('should fail validation when password is too short', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                password: 'short',
            };

            const result = validateRegister(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details[0].path).toContain('password');
            expect(result.error.details[0].type).toBe('string.min');
        });

        it('should fail validation when password is too long', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                password: 'a'.repeat(73),
            };

            const result = validateRegister(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details[0].path).toContain('password');
            expect(result.error.details[0].type).toBe('string.max');
        });

        it('should fail validation with multiple missing fields', () => {
            const invalidData = {};

            const result = validateRegister(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details).toHaveLength(3);

            const errorPaths = result.error.details.map((detail) => {
                return detail.path[0];
            });
            expect(errorPaths).toContain('fullName');
            expect(errorPaths).toContain('email');
            expect(errorPaths).toContain('password');
        });

        it('should pass with minimum valid password length', () => {
            const edgeCaseData = {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                password: 'abcd1234',
            };

            const result = validateRegister(edgeCaseData);

            expect(result.error).toBeUndefined();
        });

        it('should pass with maximum valid password length', () => {
            const edgeCaseData = {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                password: 'a'.repeat(72),
            };

            const result = validateRegister(edgeCaseData);

            expect(result.error).toBeUndefined();
        });

        it('should handle special characters in fullName', () => {
            const edgeCaseData = {
                fullName: "José María O'Connor-Smith",
                email: 'jose.maria@example.com',
                password: 'validPassword123',
            };

            const result = validateRegister(edgeCaseData);

            expect(result.error).toBeUndefined();
        });
    });

    describe('validateLogin Tests', () => {
        it('should pass validation with valid login data', () => {
            const validData = {
                email: 'john.doe@example.com',
                password: 'validPassword123',
            };

            const result = validateLogin(validData);

            expect(result.error).toBeUndefined();
            expect(result.value).toEqual(validData);
        });

        it('should fail validation when email is missing', () => {
            const invalidData = {
                password: 'validPassword123',
            };

            const result = validateLogin(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details[0].path).toContain('email');
            expect(result.error.details[0].type).toBe('any.required');
        });

        it('should fail validation with invalid email format', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'validPassword123',
            };

            const result = validateLogin(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details[0].path).toContain('email');
            expect(result.error.details[0].type).toBe('string.email');
        });

        it('should fail validation when password is too short', () => {
            const invalidData = {
                email: 'john.doe@example.com',
                password: 'short',
            };

            const result = validateLogin(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details[0].path).toContain('password');
            expect(result.error.details[0].type).toBe('string.min');
        });

        it('should fail validation when password is too long', () => {
            const invalidData = {
                email: 'john.doe@example.com',
                password: 'a'.repeat(73),
            };

            const result = validateLogin(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details[0].path).toContain('password');
            expect(result.error.details[0].type).toBe('string.max');
        });

        it('should fail validation with multiple missing fields', () => {
            const invalidData = {};

            const result = validateLogin(invalidData);

            expect(result.error).toBeDefined();
            expect(result.error.details).toHaveLength(2);

            const errorPaths = result.error.details.map((detail) => {
                return detail.path[0];
            });

            expect(errorPaths).toContain('email');
            expect(errorPaths).toContain('password');
        });

        it('should pass with minimum valid password length', () => {
            const edgeCaseData = {
                email: 'john.doe@example.com',
                password: 'abcd1234',
            };

            const result = validateLogin(edgeCaseData);

            expect(result.error).toBeUndefined();
        });

        it('should pass with maximum valid password length', () => {
            const edgeCaseData = {
                email: 'john.doe@example.com',
                password: 'a'.repeat(72),
            };

            const result = validateLogin(edgeCaseData);

            expect(result.error).toBeUndefined();
        });
    });

    describe('validateTokenPayload Tests', () => {
        it('should pass validation with valid payload data', () => {
            const mockPayload = {
                sub: 1,
                admin: true,
                iat: Math.floor(new Date() / 1000),
                exp: Math.floor(
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000,
                ),
                jti: '85018a40-06ce-4d4d-8ba5-8f9f2510c840',
                aud: 'http://localhost',
                iss: 'http://localhost',
            };
            const mockReturnValue = {
                ...mockPayload,
                iat: new Date(mockPayload.iat * 1000),
                exp: new Date(mockPayload.exp * 1000),
            };

            const result = validateTokenPayload(mockPayload);

            expect(result.error).toBeUndefined();
            expect(result.value).toStrictEqual(mockReturnValue);
        });

        it('should fail validation with multiple missing fields', () => {
            const mockPayload = {
                iat: Math.floor(new Date() / 1000),
                exp: Math.floor(
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000,
                ),
                aud: 'http://localhost',
                iss: 'http://localhost',
            };

            const result = validateTokenPayload(mockPayload);

            expect(result.error).toBeInstanceOf(ValidationError);
            expect(
                result.error.details.map((d) => {
                    return d.path[0];
                }),
            ).toEqual(expect.arrayContaining(['sub', 'jti', 'admin']));
        });

        it('should fail validation with extra field', () => {
            const mockPayload = {
                sub: 1,
                admin: true,
                iat: Math.floor(new Date() / 1000),
                exp: Math.floor(
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000,
                ),
                jti: '85018a40-06ce-4d4d-8ba5-8f9f2510c840',
                aud: 'http://localhost',
                iss: 'http://localhost',
                extraField: 'shouldNotExist',
            };

            const result = validateTokenPayload(mockPayload);

            expect(result.error).toBeInstanceOf(ValidationError);
            expect(result.error.details[0]).toEqual(
                expect.objectContaining({
                    path: expect.arrayContaining(['extraField']),
                    type: expect.stringMatching('object.unknown'),
                }),
            );
        });

        it('should fail validation with invalid field format', () => {
            const mockPayload = {
                sub: true,
                admin: 1,
                iat: { object: 'value' },
                exp: ['I am an', 'Array!'],
                jti: 123,
                aud: new Date(),
                iss: new Date(),
            };

            const result = validateTokenPayload(mockPayload);

            expect(result.error).toBeInstanceOf(ValidationError);
            expect(
                result.error.details.map((d) => {
                    return d.type;
                }),
            ).toEqual(
                expect.arrayContaining([
                    'number.base',
                    'boolean.base',
                    'date.base',
                    'string.base',
                ]),
            );
        });
    });
});
