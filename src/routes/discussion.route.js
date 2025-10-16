/**
 * @todo [15-10-2025]:
 *  @get        /api/v1/discussions/:discussionId       [authN]
 *  @post       /api/v1/discussions                     [authN] [authR: admin]
 *  @patch      /api/v1/discussions/:discussionId       [authN] [authR: admin]
 *  @delete     /api/v1/discussions/:discussionId       [authN] [authR: admin]
 */
const router = require('express').Router();
const DiscussionController = require('../controllers/discussion.controller');
const {
    authenticate,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', authenticate, asyncHandler(DiscussionController.getAll));
router.get(
    '/:discussionId',
    authenticate,
    validatePathParameterId('discussionId'),
    asyncHandler(DiscussionController.getById),
);

module.exports = router;
