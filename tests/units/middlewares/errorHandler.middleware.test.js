/* eslint-disable no-undef */
const Joi = require('joi');
const { MulterError } = require('multer');
const errorHandler = require('../../../src/middlewares/errorHandler.middleware');
const HTTPError = require('../../../src/utils/httpError');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Error Handling Middleware Unit Tests', () => {
    let err, req, res, next;

    beforeEach(() => {
        err = {};
        req = {};
        res = mockRes();
        next = jest.fn();
    });

    it('should handles Joi.ValidationError with 400 and mapped errors', () => {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(
            { email: 'not-an-email' },
            { abortEarly: false },
        );

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                statusCode: 400,
                data: null,
                message: 'Request body validation error.',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.any(String),
                        context: expect.objectContaining({
                            key: 'email',
                            value: 'not-an-email',
                        }),
                    }),
                ]),
            }),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('should handles HTTPError with given status and details mapped', () => {
        const err = new HTTPError(409, 'Resource conflict.', [
            {
                message: 'email is already registered.',
                context: { key: 'email', value: 'x@example.com' },
            },
        ]);

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                statusCode: 409,
                data: null,
                message: 'Resource conflict.',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        message: 'email is already registered.',
                        context: expect.objectContaining({
                            key: 'email',
                            value: 'x@example.com',
                        }),
                    }),
                ]),
            }),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('should handles MulterError with 413 error code', () => {
        const mockError = new MulterError('LIMIT_FILE_SIZE', 'photo');

        errorHandler(mockError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(413);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                statusCode: 413,
                data: null,
                message: 'Content Too Large.',
                errors: {
                    message: 'File too large',
                    context: {
                        key: 'photo',
                        value: null,
                    },
                },
            }),
        );
    });

    it('should handles MulterError with 400 error code', () => {
        const mockError = new MulterError('LIMIT_FIELD_VALUE', 'photo');

        errorHandler(mockError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            statusCode: 400,
            data: null,
            message: 'Invalid request.',
            errors: {
                message: 'Field value too long',
                context: {
                    key: 'photo',
                    value: null,
                },
            },
        });
    });

    it('should handles generic Error with 500 and generic message', () => {
        const err = new Error('Unexpected failure');

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                statusCode: 500,
                data: null,
                message: 'There is an issue with the server.',
                errors: null,
            }),
        );
        expect(next).not.toHaveBeenCalled();
    });
});
