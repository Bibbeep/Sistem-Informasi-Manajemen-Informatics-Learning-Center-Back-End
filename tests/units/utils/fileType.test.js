/* eslint-disable no-undef */
const { image } = require('../../../src/utils/fileType');
const HTTPError = require('../../../src/utils/httpError');

describe('File Type Utility Unit Tests', () => {
    let req, cb;

    beforeEach(() => {
        req = {};
        cb = jest.fn((x, y) => {
            return x * y;
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('image Tests', () => {
        it('should call cb with null and true', async () => {
            const mockFile = {
                mimetype: 'image/jpeg',
            };

            await image(req, mockFile, cb);

            expect(cb).toHaveBeenCalledWith(null, true);
        });

        it('should call cb with error and false', async () => {
            const mockFile = {
                mimetype: 'image/tiff',
            };

            await image(req, mockFile, cb);

            expect(cb).toHaveBeenCalledWith(
                new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message:
                            'File MIME type must be "image/jpeg", "image/png", or "image/webp"',
                        context: {
                            key: 'File MIME Type',
                            value: mockFile.mimetype,
                        },
                    },
                ]),
                false,
            );
        });

        it('should call cb with error and false when no mimetype specified', async () => {
            const mockFile = {
                mimetype: null,
            };

            await image(req, mockFile, cb);

            expect(cb).toHaveBeenCalledWith(
                new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message:
                            'File MIME type must be "image/jpeg", "image/png", or "image/webp"',
                        context: {
                            key: 'File MIME Type',
                            value: null,
                        },
                    },
                ]),
                false,
            );
        });
    });
});
