const router = require('express').Router();
const UserController = require('../controllers/user.controller.js');
const {
    authenticate,
    authorize,
    validatePathParameterId,
} = require('../middlewares/auth.middleware.js');
const {
    requireJsonContent,
} = require('../middlewares/contentType.middleware.js');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['admin'] }),
    UserController.getAll,
);
router.get(
    '/:userId',
    authenticate,
    validatePathParameterId('userId'),
    authorize({ rules: ['self', 'admin'] }),
    UserController.getById,
);
router.patch(
    '/:userId',
    authenticate,
    requireJsonContent,
    validatePathParameterId('userId'),
    authorize({ rules: ['self', 'admin'] }),
    UserController.updateById,
);
router.delete(
    '/:userId',
    authenticate,
    validatePathParameterId('userId'),
    authorize({ rules: ['self', 'admin'] }),
    UserController.deleteById,
);

module.exports = router;
