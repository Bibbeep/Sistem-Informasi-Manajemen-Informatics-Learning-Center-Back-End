const router = require('express').Router();
const InvoiceController = require('../controllers/invoice.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get(
    '/',
    authenticate,
    authorize({ rules: ['self', 'admin'], ownerQueryParam: 'required' }),
    InvoiceController.getAll,
);

module.exports = router;
