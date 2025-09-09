/* eslint-disable no-undef */
jest.mock('../../../src/services/auth.service');

const { validateRegister } = require('../../../src/validations/validator');
const AuthService = require('../../../src/services/auth.service');
const { register } = require('../../../src/controllers/auth.controller');

describe('Authentication Controller Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnValueThis?.() || { json: jest.fn() },
            json: jest.fn(),
        };

        res.status = jest.fn(() => {
            return res;
        });
        next = jest.fn();
    });

    it('should calls next with Joi.ValidationError when validation fails', async () => {
        req.body = { email: 'invalid', password: 'short' };

        const { error } = validateRegister(req.body);

        expect(error).toBeDefined();

        await register(req, res, next);

        expect(next).toHaveBeenCalled();

        const err = next.mock.calls[0][0];

        expect(err).toHaveProperty('details');
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should sends 201 on success and does not call next', async () => {
        req.body = {
            fullName: 'John Doe',
            email: 'john@example.com',
            password: 'abcd1234',
        };

        const mockDate = new Date(2025, 12, 12, 12, 12, 12, 0).toISOString();
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

        AuthService.register.mockResolvedValue(mockRegisterServiceData);

        await register(req, res, next);

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

        AuthService.register.mockRejectedValue(serviceError);

        await register(req, res, next);

        expect(next).toHaveBeenCalledWith(serviceError);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
