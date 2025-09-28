const router = require('express').Router();
const ProgramController = require('../controllers/program.controller');
const { Enrollment } = require('../db/models');
const {
    authenticate,
    validatePathParameterId,
    authorizeProgramDetails,
    authorize,
} = require('../middlewares/auth.middleware');

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
// POST /api/v1/programs
// PATCH /api/v1/programs/:programId
// DELETE /api/v1/programs/:programId
// PUT /api/v1/programs/:programId/thumbnails

module.exports = router;
