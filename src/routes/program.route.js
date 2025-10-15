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
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(ProgramController.getAll));
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
    asyncHandler(ProgramController.getById),
);
router.post(
    '/',
    authenticate,
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    asyncHandler(ProgramController.create),
);
router.patch(
    '/:programId',
    authenticate,
    validatePathParameterId('programId'),
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    asyncHandler(ProgramController.updateById),
);
router.delete(
    '/:programId',
    authenticate,
    validatePathParameterId('programId'),
    authorize({ rules: ['admin'] }),
    asyncHandler(ProgramController.deleteById),
);
router.put(
    '/:programId/thumbnails',
    authenticate,
    validatePathParameterId('programId'),
    authorize({ rules: ['admin'] }),
    upload(image).single('thumbnail'),
    asyncHandler(ProgramController.uploadThumbnail),
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
    asyncHandler(ProgramController.getAllModules),
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
    asyncHandler(ProgramController.getModuleById),
);
router.post(
    '/:programId/modules',
    authenticate,
    validatePathParameterId('programId'),
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    asyncHandler(ProgramController.createModule),
);
router.patch(
    '/:programId/modules/:moduleId',
    authenticate,
    validatePathParameterId('programId'),
    validatePathParameterId('moduleId'),
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    asyncHandler(ProgramController.updateModuleById),
);
router.delete(
    '/:programId/modules/:moduleId',
    authenticate,
    validatePathParameterId('programId'),
    validatePathParameterId('moduleId'),
    authorize({ rules: ['admin'] }),
    asyncHandler(ProgramController.deleteModuleById),
);
router.put(
    '/:programId/modules/:moduleId/materials',
    authenticate,
    validatePathParameterId('programId'),
    validatePathParameterId('moduleId'),
    authorize({ rules: ['admin'] }),
    upload(document, 25).single('material'),
    asyncHandler(ProgramController.uploadMaterial),
);

module.exports = router;
