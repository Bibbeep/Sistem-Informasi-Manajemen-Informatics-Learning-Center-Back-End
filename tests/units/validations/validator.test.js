/* eslint-disable no-undef */
const {
    validateRegister,
    validateLogin,
    validateTokenPayload,
    validateForgotPassword,
    validateResetPassword,
    validateProgramQuery,
    validateEnrollmentQuery,
    validateInvoiceQuery,
    validateCommentQuery,
} = require('../../../src/validations/validator');
const { ValidationError } = require('joi');

describe('Authentication Validation Unit Tests', () => {
    const originalEnv = process.env;

    beforeAll(() => {
        process.env.CORS_ORIGIN = '*';
        jest.useFakeTimers().setSystemTime(
            new Date('2025-12-12T00:00:00.000Z'),
        );
    });

    afterAll(() => {
        jest.useRealTimers();
        process.env = originalEnv;
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

    describe('validateForgotPassword Tests', () => {
        it('should pass validation with valid email', async () => {
            const mockEmail = 'valid@mail.com';

            const { error, value } = validateForgotPassword({
                email: mockEmail,
            });

            expect(error).toBeUndefined();
            expect(value).toStrictEqual({ email: mockEmail });
        });

        it('should fail validation with invalid email', async () => {
            const mockEmail = 'invalidmail.com';

            const { error } = validateForgotPassword({
                email: mockEmail,
            });

            expect(error).toBeInstanceOf(ValidationError);
            expect(
                error.details.map((d) => {
                    return d.type;
                }),
            ).toEqual(expect.arrayContaining(['string.email']));
        });

        it('should fail validation with missing field', async () => {
            const { error } = validateForgotPassword({
                notemail: 1,
            });

            expect(error).toBeInstanceOf(ValidationError);
            expect(
                error.details.map((d) => {
                    return d.path[0];
                }),
            ).toEqual(expect.arrayContaining(['email']));
        });
    });

    describe('validateResetPassword Tests', () => {
        it('should pass validation with valid data', async () => {
            const mockData = {
                userId: 1,
                token: 'c0ae8bc1c8ad1eea5d936c622a6850b984459d5bfd999552dc4cbecb54d02efe',
                newPassword: 'mock-new-password',
                confirmNewPassword: 'mock-new-password',
            };

            const { error, value } = validateResetPassword(mockData);

            expect(error).toBeUndefined();
            expect(value).toEqual(expect.objectContaining(mockData));
        });

        it('should fail validation with missing field', async () => {
            const { error } = validateResetPassword({
                notemail: 1,
            });

            expect(error).toBeInstanceOf(ValidationError);
            expect(
                error.details.map((d) => {
                    return d.path[0];
                }),
            ).toEqual(
                expect.arrayContaining([
                    'userId',
                    'token',
                    'newPassword',
                    'confirmNewPassword',
                ]),
            );
        });

        it('should fail validation with different confirmNewPassword', async () => {
            const mockData = {
                userId: 1,
                token: 'c0ae8bc1c8ad1eea5d936c622a6850b984459d5bfd999552dc4cbecb54d02efe',
                newPassword: 'mock-new-password',
                confirmNewPassword: 'diff-mock-new-password',
            };

            const { error } = validateResetPassword(mockData);

            expect(error).toBeInstanceOf(ValidationError);
            expect(error.details[0].context.valids[0].path[0]).toStrictEqual(
                'newPassword',
            );
        });
    });

    describe('validateProgramQuery Tests', () => {
        it('should pass validation with default valid data', async () => {
            const mockData = {
                page: '1',
                limit: '10',
                sort: 'id',
                type: 'all',
                'price.gte': '0',
            };

            const { error, value } = validateProgramQuery(mockData);

            expect(error).toBeUndefined();
            expect(value).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 10,
                    sort: 'id',
                    type: 'all',
                    'price.gte': 0,
                }),
            );
        });

        it('should pass validation with valid data', async () => {
            const mockData = {
                page: '2',
                limit: '5',
                sort: '-price',
                type: 'competition',
                'price.gte': '1000000',
                'price.lte': '2000000',
            };

            const { error, value } = validateProgramQuery(mockData);

            expect(error).toBeUndefined();
            expect(value).toEqual(
                expect.objectContaining({
                    page: 2,
                    limit: 5,
                    sort: '-priceIdr',
                    type: 'competition',
                    'price.gte': 1000000,
                    'price.lte': 2000000,
                }),
            );
        });
    });

    describe('validateEnrollmentQuery Tests', () => {
        it('should pass validation with sort by updatedAt descending', async () => {
            const { error, value } = validateEnrollmentQuery({
                sort: '-updatedAt',
            });

            expect(error).toBeUndefined();
            expect(value).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 10,
                    sort: '-updatedAt',
                    programType: 'all',
                    status: 'all',
                }),
            );
        });

        it('should pass validation with sort by progress ascending', async () => {
            const { error, value } = validateEnrollmentQuery({
                sort: 'progress',
            });

            expect(error).toBeUndefined();
            expect(value).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 10,
                    sort: 'progressPercentage',
                    programType: 'all',
                    status: 'all',
                }),
            );
        });
    });

    describe('validateInvoiceQuery Tests', () => {
        it('should pass validation with sort by paymentDue descending', async () => {
            const { error, value } = validateInvoiceQuery({
                sort: '-paymentDue',
            });

            expect(error).toBeUndefined();
            expect(value).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 10,
                    sort: '-paymentDueDatetime',
                    type: 'all',
                    status: 'all',
                }),
            );
        });

        it('should pass validation with sort by id ascending', async () => {
            const { error, value } = validateInvoiceQuery({
                sort: 'id',
            });

            expect(error).toBeUndefined();
            expect(value).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 10,
                    sort: 'id',
                    type: 'all',
                    status: 'all',
                }),
            );
        });
    });

    describe('validateCommentQuery Tests', () => {
        it('should pass validation with parentCommentId=0', async () => {
            const { error, value } = validateCommentQuery({
                parentCommentId: '0',
            });

            expect(error).toBeUndefined();
            expect(value).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 10,
                    parentCommentId: null,
                }),
            );
        });
    });
});
