const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Registers a new user account
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequestBody'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterSuccessResponse201'
 *       400:
 *         description: Invalid request body format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterFailedResponse400'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterFailedResponse409'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse429'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse500'
 */
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
