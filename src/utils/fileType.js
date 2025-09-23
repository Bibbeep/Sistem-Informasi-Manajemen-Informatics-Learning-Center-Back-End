const HTTPError = require('./httpError');

module.exports = {
    image: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }

        cb(
            new HTTPError(415, 'Unsupported Media Type.', [
                {
                    message:
                        'File MIME type must be "image/jpeg", "image/png", or "image/webp"',
                    context: {
                        key: 'File MIME Type',
                        value: file.mimetype,
                    },
                },
            ]),
            false,
        );
    },
};
