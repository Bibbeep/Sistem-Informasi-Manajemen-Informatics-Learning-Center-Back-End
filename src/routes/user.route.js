const router = require('express').Router();
const UserController = require('../controllers/user.controller.js');
const { authenticate } = require('../middlewares/auth.middleware.js');

router.get('/', authenticate, UserController.getAll);

module.exports = router;
