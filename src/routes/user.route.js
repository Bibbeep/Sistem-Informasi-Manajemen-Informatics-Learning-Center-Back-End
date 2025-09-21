const router = require('express').Router();
const UserController = require('../controllers/user.controller.js');
const {
    authenticate,
    authorize,
} = require('../middlewares/auth.middleware.js');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['admin'] }),
    UserController.getAll,
);
router.get(
    '/:userId',
    authenticate,
    authorize({ rules: ['self', 'admin'] }),
    UserController.getById,
);

module.exports = router;
