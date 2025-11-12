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
const asyncHandler = require('../utils/asyncHandler');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['admin'] }),
    asyncHandler(UserController.getAll),
);
router.get(
    '/:userId',
    authenticate,
    validatePathParameterId('userId'),
    authorize({ rules: ['self', 'admin'] }),
    asyncHandler(UserController.getById),
);
router.patch(
    '/:userId',
    authenticate,
    requireJsonContent,
    validatePathParameterId('userId'),
    authorize({ rules: ['self', 'admin'] }),
    asyncHandler(UserController.updateById),
);
router.delete(
    '/:userId',
    authenticate,
    validatePathParameterId('userId'),
    authorize({ rules: ['self', 'admin'] }),
    asyncHandler(UserController.deleteById),
);
router.put(
    '/:userId/profilePhotos',
    authenticate,
    validatePathParameterId('userId'),
    authorize({ rules: ['self', 'admin'] }),
    upload(image).single('photo'),
    asyncHandler(UserController.uploadProfilePhoto),
);

module.exports = router;
