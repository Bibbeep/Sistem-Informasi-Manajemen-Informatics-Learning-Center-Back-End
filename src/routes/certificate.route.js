const router = require('express').Router();
const CertificateController = require('../controllers/certificate.controller');
const CertificateService = require('../services/certificate.service');
const {
    authenticate,
    authorize,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');
const { requireJsonContent } = require('../middlewares/contentType.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], ownerQueryParam: 'required' }),
    asyncHandler(CertificateController.getAll),
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
    asyncHandler(CertificateController.getById),
);
router.post(
    '/',
    authenticate,
    requireJsonContent,
    authorize({
        rules: ['admin'],
    }),
    asyncHandler(CertificateController.create),
);
router.patch(
    '/:certificateId',
    authenticate,
    validatePathParameterId('certificateId'),
    requireJsonContent,
    authorize({ rules: ['admin'] }),
    asyncHandler(CertificateController.updateById),
);
router.delete(
    '/:certificateId',
    authenticate,
    validatePathParameterId('certificateId'),
    authorize({ rules: ['admin'] }),
    asyncHandler(CertificateController.deleteById),
);

module.exports = router;
