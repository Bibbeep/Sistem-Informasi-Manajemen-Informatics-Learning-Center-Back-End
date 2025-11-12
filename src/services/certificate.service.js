const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Certificate, Enrollment, Program, User } = require('../db/models');
const HTTPError = require('../utils/httpError');
const printPdf = require('../utils/printPdf');
const { s3 } = require('../configs/s3');

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

    static async create(data) {
        const { enrollmentId, issuedAt } = data;

        const enrollment = await Enrollment.findByPk(enrollmentId, {
            include: [
                {
                    model: Certificate,
                    as: 'certificate',
                    required: false,
                },
                {
                    model: Program,
                    as: 'program',
                    attributes: ['id', 'title', 'type'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName'],
                },
            ],
        });

        if (!enrollment) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Enrollment with "enrollmentId" does not exist',
                    context: {
                        key: 'enrollmentId',
                        value: enrollmentId,
                    },
                },
            ]);
        }

        if (
            enrollment.certificate &&
            (!enrollment.certificate.expiredAt ||
                !(
                    new Date(Date.now()) >=
                    new Date(enrollment.certificate.expiredAt)
                ))
        ) {
            throw new HTTPError(409, 'Resource conflict.', [
                {
                    message:
                        'Enrollment with "enrollmentId" already has an active certificate',
                    context: {
                        key: 'enrollmentId',
                        value: enrollmentId,
                    },
                },
            ]);
        }

        if (enrollment.status !== 'Completed') {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message: 'Enrollment "status" must be "Completed"',
                    context: {
                        key: 'status',
                        value: enrollment.status,
                    },
                },
            ]);
        }

        const credentialPrefix = {
            Course: 'CRS',
            Seminar: 'SMN',
            Competition: 'CMP',
            Workshop: 'WRS',
        };

        const title =
            data.title ||
            `${enrollment.program.title} Certificate of Completion`;
        const credential = `${credentialPrefix[enrollment.program.type]}${String(
            enrollment.program.id,
        ).padStart(4, '0')}-U${String(enrollment.userId).padStart(4, '0')}`;

        const fileBuffer = await printPdf(
            {
                title,
                userFullName: enrollment.user.fullName,
                programTitle: enrollment.program.title,
                programType: enrollment.program.type,
                credential,
                issuedAt: new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'long',
                }).format(new Date(issuedAt)),
                expiredAt: data.expiredAt
                    ? new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'long',
                      }).format(new Date(data.expiredAt))
                    : null,
            },
            ['..', 'templates', 'documents', 'certificate.hbs'],
        );

        const fileName = `documents/certificates/${credential}-${Date.now().toString()}.pdf`;

        const client = new Upload({
            client: s3,
            params: {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: 'application/pdf',
                ACL: 'public-read',
            },
        });

        const { Location } = await client.done();
        const payload = {
            enrollmentId,
            userId: enrollment.userId,
            title,
            credential,
            documentUrl: Location,
            issuedAt,
            expiredAt: data.expiredAt || null,
        };

        const certificate = await Certificate.create(payload);

        return {
            ...certificate.toJSON(),
            programId: enrollment.programId,
            programTitle: enrollment.program.title,
            programType: enrollment.program.type,
            programThumbnailUrl: enrollment.program.thumbnailUrl,
        };
    }

    static async updateOne(data) {
        const { certificateId, updateData } = data;

        const certificate = await Certificate.findByPk(certificateId, {
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    attributes: ['programId'],
                    include: [
                        {
                            model: Program,
                            as: 'program',
                            attributes: ['title', 'type', 'thumbnailUrl'],
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['fullName'],
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

        if (
            updateData.expiredAt &&
            new Date(updateData.expiredAt) <= new Date(certificate.issuedAt)
        ) {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message:
                        'Certificate "expiredAt" cannot be earlier than "issuedAt"',
                    context: {
                        key: 'expiredAt',
                        value: updateData.expiredAt,
                    },
                },
            ]);
        }

        const fileBuffer = await printPdf(
            {
                title: updateData.title || certificate.title,
                userFullName: certificate.enrollment.user.fullName,
                programTitle: certificate.enrollment.program.title,
                programType: certificate.enrollment.program.type,
                credential: certificate.credential,
                issuedAt: new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'long',
                }).format(new Date(certificate.issuedAt)),
                expiredAt: updateData.expiredAt
                    ? new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'long',
                      }).format(new Date(updateData.expiredAt))
                    : certificate.expiredAt,
            },
            ['..', 'templates', 'documents', 'certificate.hbs'],
        );

        const fileName = `documents/certificates/${certificate.credential}-${Date.now().toString()}.pdf`;

        const client = new Upload({
            client: s3,
            params: {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: 'application/pdf',
                ACL: 'public-read',
            },
        });

        const { Location } = await client.done();

        // eslint-disable-next-line no-unused-vars
        const [count, rows] = await Certificate.update(
            { ...updateData, documentUrl: Location },
            {
                where: {
                    id: certificateId,
                },
                returning: true,
            },
        );

        return {
            ...rows[0].toJSON(),
            programId: certificate.enrollment?.programId,
            programTitle: certificate.enrollment?.program?.title,
            programType: certificate.enrollment?.program?.type,
            programThumbnailUrl: certificate.enrollment?.program?.thumbnailUrl,
        };
    }

    static async deleteOne(certificateId) {
        const certificate = await Certificate.findByPk(certificateId);

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

        if (certificate.documentUrl) {
            const oldKey = certificate.documentUrl.split('/').pop();

            await s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `documents/certificates/${oldKey}`,
                }),
            );
        }

        await Certificate.destroy({ where: { id: certificateId } });
    }
}

module.exports = CertificateService;
