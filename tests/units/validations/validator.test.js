/* eslint-disable no-undef */
const { validateRegister } = require('../../../src/validations/validator');

describe('Authentication Validation Unit Tests', () => {
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
});
