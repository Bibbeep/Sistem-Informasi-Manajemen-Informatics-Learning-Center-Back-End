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
// PUT /api/v1/programs/:programId/thumbnails

module.exports = router;
