const router = require('express').Router();
const FeedbackController = require('../controllers/feedback.controller');
const {
    authenticate,
    authorize,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');
const { requireJsonContent } = require('../middlewares/contentType.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['admin'] }),
    asyncHandler(FeedbackController.getAll),
);
router.get(
    '/:feedbackId',
    authenticate,
    validatePathParameterId('feedbackId'),
    authorize({ rules: ['admin'] }),
    asyncHandler(FeedbackController.getById),
);
router.post('/', requireJsonContent, asyncHandler(FeedbackController.create));
router.post(
    '/:feedbackId/responses',
    authenticate,
    requireJsonContent,
    validatePathParameterId('feedbackId'),
    authorize({ rules: ['admin'] }),
    asyncHandler(FeedbackController.createResponse),
);

module.exports = router;
