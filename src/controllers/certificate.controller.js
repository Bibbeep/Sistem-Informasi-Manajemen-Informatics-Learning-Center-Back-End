const CertificateService = require('../services/certificate.service.js');
const {
    validateCertificateQuery,
    validateCertificate,
    validateUpdateCertificateData,
} = require('../validations/validator.js');

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
    create: async (req, res, next) => {
        try {
            const { error, value } = validateCertificate(req.body);

            if (error) {
                throw error;
            }

            const certificate = await CertificateService.create(value);

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Successfully created a certificate.',
                data: {
                    certificate,
                },
                errors: null,
            });
        } catch (err) {
            next(err);
        }
    },
    updateById: async (req, res, next) => {
        try {
            const { error, value } = validateUpdateCertificateData(req.body);

            if (error) {
                throw error;
            }

            const certificate = await CertificateService.updateOne({
                certificateId: parseInt(req.params.certificateId, 10),
                updateData: value,
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Successfully updated a certificate.',
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
