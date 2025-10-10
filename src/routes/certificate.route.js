/**
 * @todo GET /api/v1/certificates/:certificateId
 * @todo POST /api/v1/certificates
 * @todo PATCH /api/v1/certificates/:certificateId
 * @todo DELETE /api/v1/certificates/:certificateId
 */
const router = require('express').Router();
const CertificateController = require('../controllers/certificate.controller');

router.get('/', CertificateController.getAll);

module.exports = router;
