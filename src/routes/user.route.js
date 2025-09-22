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
const { upload } = require('../middlewares/multer.middleware.js');
const { image } = require('../utils/fileType.js');

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
router.put(
    '/:userId/profilePhotos',
    authenticate,
    validatePathParameterId('userId'),
    authorize({ rules: ['self', 'admin'] }),
    upload(image).single('photo'),
    UserController.uploadProfilePhoto,
);

module.exports = router;
