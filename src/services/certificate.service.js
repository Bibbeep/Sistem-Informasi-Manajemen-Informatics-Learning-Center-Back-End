const { Certificate, Enrollment, Program } = require('../db/models');

class CertificateService {
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
}

module.exports = CertificateService;
