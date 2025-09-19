const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireJsonContent } = require('../middlewares/contentType.middleware');

router.post('/register', requireJsonContent, AuthController.register);
router.post('/login', requireJsonContent, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post(
    '/forgot-password',
    requireJsonContent,
    AuthController.forgotPassword,
);
router.post(
    '/reset-password',
    requireJsonContent,
    AuthController.resetPassword,
);

module.exports = router;
