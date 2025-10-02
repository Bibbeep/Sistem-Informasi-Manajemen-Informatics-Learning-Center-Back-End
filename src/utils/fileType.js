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
    document: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'text/plain',
            'text/csv',
            'application/rtf',
            'application/zip',
            'application/vnd.rar',
            'application/x-tar',
            'application/x-7z-compressed',
            'application/gzip',
            'application/x-bzip2',
            'application/x-xz',
            'application/epub+zip',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }

        cb(
            new HTTPError(415, 'Unsupported Media Type.', [
                {
                    message: `File MIME type must be${allowedMimeTypes.map(
                        (str, idx) => {
                            if (idx !== allowedMimeTypes.length - 1) {
                                return ` "${str}"`;
                            }
                            return ` or "${str}"`;
                        },
                    )}.`,
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
