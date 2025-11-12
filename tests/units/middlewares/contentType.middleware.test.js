/* eslint-disable no-undef */
const HTTPError = require('../../../src/utils/httpError');
const {
    requireJsonContent,
} = require('../../../src/middlewares/contentType.middleware');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Content-Type Validator Middleware Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = mockRes();
        next = jest.fn();
    });

    describe('requireJsonContent Tests', () => {
        it('should call next without error', () => {
            req.headers = {
                'content-type': 'application/json',
            };
            req.method = 'POST';

            requireJsonContent(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with 415 error when Content-Type is not application/json', () => {
            req.headers = {
                'content-type': 'multipart/form-data',
            };
            req.method = 'POST';

            requireJsonContent(req, res, next);

            expect(next).toHaveBeenCalledWith(
                new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message:
                            'Content-Type headers must be application/json',
                        context: {
                            key: 'Content-Type',
                            value: 'multipart/form-data',
                        },
                    },
                ]),
            );
        });

        it('should call next with 415 error when Content-Type is not specified', () => {
            req.method = 'POST';

            requireJsonContent(req, res, next);

            expect(next).toHaveBeenCalledWith(
                new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message:
                            'Content-Type headers must be application/json',
                        context: {
                            key: 'Content-Type',
                            value: null,
                        },
                    },
                ]),
            );
        });
    });
});
