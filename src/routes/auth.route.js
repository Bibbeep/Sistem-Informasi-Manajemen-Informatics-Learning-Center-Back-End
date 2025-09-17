const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @openapi
 * tags:
 *   - name: User Authentication
 *     description: User account management
 */

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Registers a new user account
 *     tags: [User Authentication]
 *     produces:
 *       - application/json
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
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               BadRequest:
 *                 $ref: '#/components/examples/BadRequest'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               Conflict:
 *                 $ref: '#/components/examples/Conflict'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               TooManyRequests:
 *                 $ref: '#/components/examples/TooManyRequests'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/examples/InternalServerError'
 */
router.post('/register', AuthController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Logs in a user account
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequestBody'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginSuccessResponse200'
 *       400:
 *         description: Invalid request body format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               BadRequest:
 *                 $ref: '#/components/examples/BadRequest'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               Unauthorized:
 *                 $ref: '#/components/examples/Unauthorized'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               TooManyRequests:
 *                 $ref: '#/components/examples/TooManyRequests'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/examples/InternalServerError'
 */
router.post('/login', AuthController.login);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logs out a user account
 *     tags: [User Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer JWT access token
 *         schema:
 *           type: string
 *           format: JWT
 *         required: true
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutSuccessResponse200'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               Unauthorized:
 *                 $ref: '#/components/examples/Unauthorized'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               TooManyRequests:
 *                 $ref: '#/components/examples/TooManyRequests'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/examples/InternalServerError'
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Sends an email with a URL to reset password
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequestBody'
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordSuccessResponse200'
 *       400:
 *         description: Invalid request body format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               BadRequest:
 *                 $ref: '#/components/examples/BadRequest'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               TooManyRequests:
 *                 $ref: '#/components/examples/TooManyRequests'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailedResponse'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/examples/InternalServerError'
 */
router.post('/forgot-password', AuthController.forgotPassword);

module.exports = router;
