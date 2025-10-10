const router = require('express').Router();
const CertificateController = require('../controllers/certificate.controller');
const CertificateService = require('../services/certificate.service');
const {
    authenticate,
    authorize,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');
const { requireJsonContent } = require('../middlewares/contentType.middleware');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], ownerQueryParam: 'required' }),
    CertificateController.getAll,
);
router.get(
    '/:certificateId',
    authenticate,
    validatePathParameterId('certificateId'),
    authorize({
        rules: ['self', 'admin'],
        ownerService: CertificateService,
        param: 'certificateId',
        ownerQueryParam: 'prohibited',
    }),
    CertificateController.getById,
);
router.post(
    '/',
    authenticate,
    requireJsonContent,
    authorize({
        rules: ['admin'],
    }),
    CertificateController.create,
);

module.exports = router;
