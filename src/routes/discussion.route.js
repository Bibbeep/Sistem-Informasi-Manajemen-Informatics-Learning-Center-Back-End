/**
 * @todo [17-10-2025]:
 * @GET /api/v1/discussions/:discussionId/comments
 * @GET /api/v1/discussions/:discussionId/comments/:commentId
 * @POST /api/v1/discussions/:discussionId/comments
 * @PATCH /api/v1/discussions/:discussionId/comments/:commentId
 * @DELETE /api/v1/discussions/:discussionId/comments/:commentId
 * @POST /api/v1/discussions/:discussionId/comments/:commentId/likes
 * @DELETE /api/v1/discussions/:discussionId/comments/:commentId/likes
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
router.delete(
    '/:discussionId',
    authenticate,
    validatePathParameterId('discussionId'),
    authorize({
        rules: ['admin'],
    }),
    asyncHandler(DiscussionController.deleteById),
);
router.get(
    '/:discussionId/comments',
    authenticate,
    validatePathParameterId('discussionId'),
    asyncHandler(DiscussionController.getAllComments),
);

module.exports = router;
