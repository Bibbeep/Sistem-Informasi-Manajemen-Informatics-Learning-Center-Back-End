const router = require('express').Router();
const FeedbackController = require('../controllers/feedback.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['admin'] }),
    FeedbackController.getAll,
);

module.exports = router;
