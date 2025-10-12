const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireJsonContent } = require('../middlewares/contentType.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.post(
    '/register',
    requireJsonContent,
    asyncHandler(AuthController.register),
);
router.post('/login', requireJsonContent, asyncHandler(AuthController.login));
router.post('/logout', authenticate, asyncHandler(AuthController.logout));
router.post(
    '/forgot-password',
    requireJsonContent,
    asyncHandler(AuthController.forgotPassword),
);
router.post(
    '/reset-password',
    requireJsonContent,
    asyncHandler(AuthController.resetPassword),
);

module.exports = router;
