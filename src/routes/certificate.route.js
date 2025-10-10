/**
 * @module CertificateAPI
 */

const router = require('express').Router();
const CertificateController = require('../controllers/certificate.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @api {get} /api/v1/certificates Get all certificates
 * @apiName GetCertificates
 * @apiGroup Certificates
 */
router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], ownerQueryParam: 'required' }),
    CertificateController.getAll,
);

module.exports = router;
