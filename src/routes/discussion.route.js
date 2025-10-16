/**
 * @todo [15-10-2025]:
 *  @delete     /api/v1/discussions/:discussionId       [authN] [authR: admin]
 */
const router = require('express').Router();
const DiscussionController = require('../controllers/discussion.controller');
const {
    authenticate,
    validatePathParameterId,
    authorize,
} = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { requireJsonContent } = require('../middlewares/contentType.middleware');

router.get('/', authenticate, asyncHandler(DiscussionController.getAll));
router.get(
    '/:discussionId',
    authenticate,
    validatePathParameterId('discussionId'),
    asyncHandler(DiscussionController.getById),
);
router.post(
    '/',
    authenticate,
    requireJsonContent,
    authorize({
        rules: ['admin'],
    }),
    asyncHandler(DiscussionController.create),
);
router.patch(
    '/:discussionId',
    authenticate,
    validatePathParameterId('discussionId'),
    requireJsonContent,
    authorize({
        rules: ['admin'],
    }),
    asyncHandler(DiscussionController.updateById),
);

module.exports = router;
