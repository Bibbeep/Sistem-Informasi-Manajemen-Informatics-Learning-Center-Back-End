const router = require('express').Router();
const ProgramController = require('../controllers/program.controller');

// GET /api/v1/programs
router.get('/', ProgramController.getAll);
// GET /api/v1/programs/:programId
// POST /api/v1/programs
// PATCH /api/v1/programs/:programId
// DELETE /api/v1/programs/:programId
// PUT /api/v1/programs/:programId/thumbnails

module.exports = router;
