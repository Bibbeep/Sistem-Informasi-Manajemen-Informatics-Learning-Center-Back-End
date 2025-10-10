const router = require('express').Router();
const CertificateController = require('../controllers/certificate.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], ownerQueryParam: 'required' }),
    CertificateController.getAll,
);

module.exports = router;
