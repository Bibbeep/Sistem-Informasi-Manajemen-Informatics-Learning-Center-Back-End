const { Invoice, Enrollment, Program, Payment } = require('../db/models');
const HTTPError = require('../utils/httpError');

class InvoiceService {
    static name = 'Invoice';
    static async getOwnerId(invoiceId) {
        const invoice = await Invoice.findByPk(invoiceId, {
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    attributes: ['userId'],
                },
            ],
        });

        return invoice ? invoice.enrollment?.userId : null;
    }

    static async getMany(data) {
        const { page, limit, sort, status, type } = data;
        let where = {};

        if (status !== 'all') {
            where.status = status.charAt(0).toUpperCase() + status.slice(1);
        }

        let enrollmentWhere = {};
        if (data.userId) {
            enrollmentWhere.userId = data.userId;
        }

        let programWhere = {};
        if (type !== 'all') {
            programWhere.type = type.charAt(0).toUpperCase() + type.slice(1);
        }

        const { count, rows } = await Invoice.findAndCountAll({
            where,
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    where: enrollmentWhere,
                    attributes: ['userId', 'programId'],
                    include: [
                        {
                            model: Program,
                            as: 'program',
                            where: programWhere,
                            attributes: ['title', 'type', 'thumbnailUrl'],
                        },
                    ],
                },
                {
                    model: Payment,
                    as: 'payment',
                    attributes: {
                        exclude: ['invoiceId'],
                    },
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
        });

        if (rows.length) {
            rows.forEach((invoice, index) => {
                rows[index] = {
                    id: invoice.id,
                    userId: invoice.enrollment?.userId,
                    programId: invoice.enrollment?.programId,
                    programTitle: invoice.enrollment?.program?.title,
                    programType: invoice.enrollment?.program?.type,
                    programThumbnailUrl:
                        invoice.enrollment?.program?.thumbnailUrl,
                    virtualAccountNumber: invoice.virtualAccountNumber,
                    amountIdr: invoice.amountIdr,
                    paymentDueDatetime: invoice.paymentDueDatetime,
                    status: invoice.status,
                    payment: invoice.payment
                        ? {
                              id: invoice.payment.id,
                              amountPaidIdr: invoice.payment.amountPaidIdr,
                              createdAt: invoice.payment.createdAt,
                              updatedAt: invoice.payment.updatedAt,
                          }
                        : null,
                    createdAt: invoice.createdAt,
                    updatedAt: invoice.updatedAt,
                    deletedAt: invoice.deletedAt,
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
            invoices: rows,
        };
    }

    static async getOne(invoiceId) {
        const invoice = await Invoice.findByPk(invoiceId, {
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    attributes: ['userId', 'programId'],
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
                {
                    model: Payment,
                    as: 'payment',
                    required: false,
                    attributes: {
                        exclude: ['invoiceId'],
                    },
                },
            ],
        });

        if (!invoice) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Invoice with "invoiceId" does not exist',
                    context: {
                        key: 'invoiceId',
                        value: invoiceId,
                    },
                },
            ]);
        }

        return {
            id: invoice.id,
            userId: invoice.enrollment?.userId,
            programId: invoice.enrollment?.programId,
            programTitle: invoice.enrollment?.program?.title,
            programType: invoice.enrollment?.program?.type,
            programThumbnailUrl: invoice.enrollment?.program?.thumbnailUrl,
            virtualAccountNumber: invoice.virtualAccountNumber,
            amountIdr: invoice.amountIdr,
            paymentDueDatetime: invoice.paymentDueDatetime,
            status: invoice.status,
            payment: invoice.payment
                ? {
                      id: invoice.payment.id,
                      amountPaidIdr: invoice.payment.amountPaidIdr,
                      createdAt: invoice.payment.createdAt,
                      updatedAt: invoice.payment.updatedAt,
                  }
                : null,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
            deletedAt: invoice.deletedAt,
        };
    }

    static async deleteOne(invoiceId) {
        const isInvoiceExist = await Invoice.findByPk(invoiceId);

        if (!isInvoiceExist) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Invoice with "invoiceId" does not exist',
                    context: {
                        key: 'invoiceId',
                        value: invoiceId,
                    },
                },
            ]);
        }

        await Invoice.destroy({ where: { id: invoiceId } });
    }
}

module.exports = InvoiceService;
