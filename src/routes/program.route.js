const router = require('express').Router();
const ProgramController = require('../controllers/program.controller');
const {
    authenticate,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');

router.get('/', ProgramController.getAll);
router.get(
    '/:programId',
    authenticate,
    validatePathParameterId('programId'),
    ProgramController.getById,
);
// POST /api/v1/programs
// PATCH /api/v1/programs/:programId
// DELETE /api/v1/programs/:programId
// PUT /api/v1/programs/:programId/thumbnails

module.exports = router;
