const multer = require('multer');

module.exports = {
    upload: (filter, maxSizeMB = 5) => {
        return multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 1024 * 1024 * maxSizeMB,
                files: 1,
            },
            fileFilter: filter,
        });
    },
};
