/**
 * @todo [20-10-2025]:
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
const { Comment } = require('../db/models');

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
router.get(
    '/:discussionId/comments/:commentId',
    authenticate,
    validatePathParameterId('discussionId'),
    validatePathParameterId('commentId'),
    asyncHandler(DiscussionController.getCommentById),
);
router.post(
    '/:discussionId/comments',
    authenticate,
    validatePathParameterId('discussionId'),
    requireJsonContent,
    asyncHandler(DiscussionController.createComment),
);
router.patch(
    '/:discussionId/comments/:commentId',
    authenticate,
    validatePathParameterId('discussionId'),
    validatePathParameterId('commentId'),
    requireJsonContent,
    authorize({
        rules: ['self', 'admin'],
        model: Comment,
        param: 'commentId',
        ownerForeignKey: 'userId',
        ownerQueryParam: 'prohibited',
    }),
    asyncHandler(DiscussionController.updateCommentById),
);
router.delete(
    '/:discussionId/comments/:commentId',
    authenticate,
    validatePathParameterId('discussionId'),
    validatePathParameterId('commentId'),
    authorize({
        rules: ['self', 'admin'],
        model: Comment,
        param: 'commentId',
        ownerForeignKey: 'userId',
        ownerQueryParam: 'prohibited',
    }),
    asyncHandler(DiscussionController.deleteCommentById),
);

module.exports = router;
