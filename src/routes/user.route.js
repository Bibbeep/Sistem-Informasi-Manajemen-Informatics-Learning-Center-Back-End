const router = require('express').Router();
const UserController = require('../controllers/user.controller.js');
const {
    authenticate,
    authorize,
} = require('../middlewares/auth.middleware.js');

router.get('/', authenticate, authorize('admin'), UserController.getAll);

module.exports = router;
