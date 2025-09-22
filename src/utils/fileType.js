const HTTPError = require('./httpError');

module.exports = {
    image: async (req, file, cb) => {
        try {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new HTTPError(415, 'Unsupported Media Type.', [
                    {
                        message:
                            'File MIME type must be "image/jpeg", "image/png", or "image/webp"',
                        context: {
                            key: 'File MIME Type',
                            value: file.mimetype || null,
                        },
                    },
                ]);
            }

            cb(null, true);
        } catch (err) {
            cb(err, false);
        }
    },
};
