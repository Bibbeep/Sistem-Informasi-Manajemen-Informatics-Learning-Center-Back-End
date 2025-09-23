const multer = require('multer');

module.exports = {
    upload: (filter) => {
        return multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 1024 * 1024 * 5,
                files: 1,
            },
            fileFilter: filter,
        });
    },
};
