/* eslint-disable no-undef */
jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/validations/validator');

const { validateRegister } = require('../../../src/validations/validator');
const AuthService = require('../../../src/services/auth.service');
const { register } = require('../../../src/controllers/auth.controller');
const { ValidationError } = require('joi');

describe('Authentication Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis?.() || { json: jest.fn() },
            json: jest.fn(),
        };

        res.status = jest.fn(() => {
            return res;
        });

        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register Tests', () => {
        it('should calls next with Joi.ValidationError when validation fails', async () => {
            req.body = { email: 'invalid', password: 'short' };
            const mockValidationError = new ValidationError();

            validateRegister.mockReturnValue({ error: mockValidationError });

            await register(req, res, next);

            expect(validateRegister).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(mockValidationError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should sends 201 on success and does not call next', async () => {
            req.body = {
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'abcd1234',
            };

            const mockDate = new Date(
                2025,
                12,
                12,
                12,
                12,
                12,
                0,
            ).toISOString();
            const mockRegisterServiceData = {
                user: {
                    id: 1,
                    fullName: req.body.fullName,
                    email: req.body.email,
                    memberLevel: 'Basic',
                    role: 'User',
                    pictureUrl: 'https://mock.pic/999',
                    createdAt: mockDate,
                    updatedAt: mockDate,
                },
            };

            validateRegister.mockReturnValue({ error: null, value: req.body });
            AuthService.register.mockResolvedValue(mockRegisterServiceData);

            await register(req, res, next);

            expect(validateRegister).toHaveBeenCalledWith(req.body);
            expect(AuthService.register).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    statusCode: 201,
                    data: mockRegisterServiceData,
                    message: 'Successfully registered a new user account.',
                    errors: null,
                }),
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should forwards service errors to next', async () => {
            req.body = {
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'abcd1234',
            };

            const serviceError = new Error('Boom');
            validateRegister.mockReturnValue({ error: null, value: req.body });
            AuthService.register.mockRejectedValue(serviceError);

            await register(req, res, next);

            expect(validateRegister).toHaveBeenCalledWith(req.body);
            expect(AuthService.register).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(serviceError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
