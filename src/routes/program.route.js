const router = require('express').Router();
const ProgramController = require('../controllers/program.controller');
const { Enrollment } = require('../db/models');
const {
    authenticate,
    validatePathParameterId,
    authorizeProgramDetails,
    authorize,
} = require('../middlewares/auth.middleware');
const { requireJsonContent } = require('../middlewares/contentType.middleware');
const { upload } = require('../middlewares/multer.middleware.js');
const { image } = require('../utils/fileType.js');

router.get('/', ProgramController.getAll);
router.get(
    '/:programId',
    authenticate,
    validatePathParameterId('programId'),
    authorizeProgramDetails,
    authorize({
        rules: ['self', 'admin'],
        model: Enrollment,
        param: 'enrollmentId',
        ownerForeignKey: 'userId',
    }),
    ProgramController.getById,
);
router.post(
    '/',
    authenticate,
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    ProgramController.create,
);
router.patch(
    '/:programId',
    authenticate,
    validatePathParameterId('programId'),
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    ProgramController.updateById,
);
router.delete(
    '/:programId',
    authenticate,
    validatePathParameterId('programId'),
    authorize({ rules: ['admin'] }),
    ProgramController.deleteById,
);
router.put(
    '/:programId/thumbnails',
    authenticate,
    validatePathParameterId('programId'),
    authorize({ rules: ['admin'] }),
    upload(image).single('thumbnail'),
    ProgramController.uploadThumbnail,
);

module.exports = router;
