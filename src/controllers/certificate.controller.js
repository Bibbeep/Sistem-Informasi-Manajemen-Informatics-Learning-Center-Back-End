const CertificateService = require('../services/certificate.service.js');
const { validateCertificateQuery } = require('../validations/validator.js');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const { error, value } = validateCertificateQuery(req.query);

            if (error) {
                throw error;
            }

            const { pagination, certificates } =
                await CertificateService.getMany(value);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved all certificates.',
                data: {
                    certificates,
                },
                pagination,
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            const certificate = await CertificateService.getOne(
                parseInt(req.params.certificateId, 10),
            );

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully retrieved a certificate.',
                data: {
                    certificate,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
