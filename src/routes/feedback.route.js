const router = require('express').Router();
const FeedbackController = require('../controllers/feedback.controller');
const {
    authenticate,
    authorize,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['admin'] }),
    FeedbackController.getAll,
);
router.get(
    '/:feedbackId',
    authenticate,
    validatePathParameterId('feedbackId'),
    authorize({ rules: ['admin'] }),
    FeedbackController.getById,
);

module.exports = router;
