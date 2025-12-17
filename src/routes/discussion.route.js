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
router.post(
    '/:discussionId/comments/:commentId/likes',
    authenticate,
    validatePathParameterId('discussionId'),
    validatePathParameterId('commentId'),
    asyncHandler(DiscussionController.createLike),
);
router.delete(
    '/:discussionId/comments/:commentId/likes',
    authenticate,
    validatePathParameterId('discussionId'),
    validatePathParameterId('commentId'),
    asyncHandler(DiscussionController.deleteLike),
);

module.exports = router;
