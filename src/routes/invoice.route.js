const router = require('express').Router();
const InvoiceController = require('../controllers/invoice.controller');
const {
    authenticate,
    authorize,
    validatePathParameterId,
} = require('../middlewares/auth.middleware');
const InvoiceService = require('../services/invoice.service');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], ownerQueryParam: 'required' }),
    InvoiceController.getAll,
);
router.get(
    '/:invoiceId',
    authenticate,
    validatePathParameterId('invoiceId'),
    authorize({
        rules: ['self', 'admin'],
        ownerService: InvoiceService,
        param: 'invoiceId',
        ownerQueryParam: 'prohibited',
    }),
    InvoiceController.getById,
);

module.exports = router;
