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
const { image, document } = require('../utils/fileType.js');

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
router.get(
    '/:programId/modules',
    authenticate,
    validatePathParameterId('programId'),
    authorizeProgramDetails,
    authorize({
        rules: ['self', 'admin'],
        model: Enrollment,
        param: 'enrollmentId',
        ownerForeignKey: 'userId',
    }),
    ProgramController.getAllModules,
);
router.get(
    '/:programId/modules/:moduleId',
    authenticate,
    validatePathParameterId('programId'),
    validatePathParameterId('moduleId'),
    authorizeProgramDetails,
    authorize({
        rules: ['self', 'admin'],
        model: Enrollment,
        param: 'enrollmentId',
        ownerForeignKey: 'userId',
    }),
    ProgramController.getModuleById,
);
router.post(
    '/:programId/modules',
    authenticate,
    validatePathParameterId('programId'),
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    ProgramController.createModule,
);
router.patch(
    '/:programId/modules/:moduleId',
    authenticate,
    validatePathParameterId('programId'),
    validatePathParameterId('moduleId'),
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    ProgramController.updateModuleById,
);
router.delete(
    '/:programId/modules/:moduleId',
    authenticate,
    validatePathParameterId('programId'),
    validatePathParameterId('moduleId'),
    authorize({ rules: ['admin'] }),
    ProgramController.deleteModuleById,
);
router.put(
    '/:programId/modules/:moduleId/materials',
    authenticate,
    validatePathParameterId('programId'),
    validatePathParameterId('moduleId'),
    authorize({ rules: ['admin'] }),
    upload(document, 25).single('material'),
    ProgramController.uploadMaterial,
);

module.exports = router;
