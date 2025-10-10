const { Certificate, Enrollment, Program } = require('../db/models');
const HTTPError = require('../utils/httpError');

class CertificateService {
    static name = 'Certificate';
    static async getOwnerId(certificateId) {
        const certificate = await Certificate.findByPk(certificateId, {
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    attributes: ['userId'],
                },
            ],
        });

        return certificate ? certificate.enrollment?.userId : null;
    }

    static async getMany(data) {
        const { page, limit, sort, type } = data;
        let where = {};
        let enrollmentWhere = {};
        let programWhere = {};

        if (data.credential) {
            where.credential = data.credential;
        }

        if (data.userId) {
            enrollmentWhere.userId = data.userId;
        }

        if (data.programId) {
            enrollmentWhere.programId = data.programId;
        }

        if (type !== 'all') {
            programWhere.type = type.charAt(0).toUpperCase() + type.slice(1);
        }

        const { count, rows } = await Certificate.findAndCountAll({
            where,
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    where: enrollmentWhere,
                    attributes: ['programId'],
                    include: [
                        {
                            model: Program,
                            as: 'program',
                            where: programWhere,
                            attributes: ['title', 'type', 'thumbnailUrl'],
                        },
                    ],
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
        });

        if (rows.length) {
            rows.forEach((certificate, index) => {
                rows[index] = {
                    id: certificate.id,
                    userId: certificate.userId,
                    enrollmentId: certificate.enrollmentId,
                    programId: certificate.enrollment?.programId,
                    programTitle: certificate.enrollment?.program?.title,
                    programType: certificate.enrollment?.program?.type,
                    programThumbnailUrl:
                        certificate.enrollment?.program?.thumbnailUrl,
                    title: certificate.title,
                    credential: certificate.credential,
                    documentUrl: certificate.documentUrl,
                    issuedAt: certificate.issuedAt,
                    expiredAt: certificate.expiredAt,
                    createdAt: certificate.createdAt,
                    updatedAt: certificate.updatedAt,
                };
            });
        }

        const totalPages = Math.ceil(count / limit);

        return {
            pagination: {
                currentRecords: rows.length,
                totalRecords: count,
                currentPage: page,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage:
                    page > totalPages + 1 ? null : page > 1 ? page - 1 : null,
            },
            certificates: rows,
        };
    }

    static async getOne(certificateId) {
        const certificate = await Certificate.findByPk(certificateId, {
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    attributes: ['programId'],
                    required: false,
                    include: [
                        {
                            model: Program,
                            as: 'program',
                            required: false,
                            attributes: ['title', 'type', 'thumbnailUrl'],
                        },
                    ],
                },
            ],
        });

        if (!certificate) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Certificate with "certificateId" does not exist',
                    context: {
                        key: 'certificateId',
                        value: certificateId,
                    },
                },
            ]);
        }

        return {
            id: certificate.id,
            userId: certificate.userId,
            enrollmentId: certificate.enrollmentId,
            programId: certificate.enrollment?.programId,
            programTitle: certificate.enrollment?.program?.title,
            programType: certificate.enrollment?.program?.type,
            programThumbnailUrl: certificate.enrollment?.program?.thumbnailUrl,
            title: certificate.title,
            credential: certificate.credential,
            documentUrl: certificate.documentUrl,
            issuedAt: certificate.issuedAt,
            expiredAt: certificate.issuedAt,
            createdAt: certificate.createdAt,
            updatedAt: certificate.updatedAt,
        };
    }
}

module.exports = CertificateService;
