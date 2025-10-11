/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
jest.mock('../../../src/utils/printPdf');
jest.mock('@aws-sdk/lib-storage');
jest.mock('@aws-sdk/client-s3');
jest.mock('../../../src/configs/s3');
const { Certificate, Enrollment } = require('../../../src/db/models');
const CertificateService = require('../../../src/services/certificate.service');
const HTTPError = require('../../../src/utils/httpError');
const printPdf = require('../../../src/utils/printPdf');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../../../src/configs/s3');
const { faker } = require('@faker-js/faker');

describe('Certificate Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMany', () => {
        const mockRows = new Array(10)
            .fill(
                {
                    id: 1,
                    userId: 1,
                    enrollmentId: 1,
                    title: 'title',
                    credential: 'CRS0001-U0001',
                    documentUrl: 'https://certificate.com/cert.pdf',
                    issuedAt: Date.now(),
                    expiredAt: Date.now(),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    enrollment: {
                        programId: 1,
                        program: {
                            title: 'title',
                            type: 'type',
                            thumbnailUrl: 'https://thumbnail.com/thumb.webp',
                        },
                    },
                },
                0,
                4,
            )
            .fill(
                {
                    id: 1,
                    userId: 1,
                    enrollmentId: 1,
                    title: 'title',
                    credential: 'CRS0001-U0001',
                    documentUrl: 'https://certificate.com/cert.pdf',
                    issuedAt: Date.now(),
                    expiredAt: Date.now(),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    enrollment: {
                        programId: 1,
                    },
                },
                5,
                7,
            )
            .fill(
                {
                    id: 1,
                    userId: 1,
                    enrollmentId: 1,
                    title: 'title',
                    credential: 'CRS0001-U0001',
                    documentUrl: 'https://certificate.com/cert.pdf',
                    issuedAt: Date.now(),
                    expiredAt: Date.now(),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                8,
                9,
            );

        it('should return certificate data with default query', async () => {
            const mockData = {
                page: 1,
                limit: 10,
                sort: 'id',
                type: 'all',
            };
            const mockCount = 30;
            const mockResult = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 30,
                    currentPage: 1,
                    totalPages: 3,
                    nextPage: 2,
                    prevPage: null,
                },
                certificates: expect.any(Array),
            };

            Certificate.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await CertificateService.getMany(mockData);

            expect(Certificate.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(expect.objectContaining(mockResult));
        });

        it('should return certificate data with specified query', async () => {
            const mockData = {
                page: 3,
                limit: 10,
                sort: '-issuedAt',
                type: 'Course',
                credential: 'CRS0001-U0001',
                userId: 1,
                programId: 1,
            };
            const mockCount = 30;
            const mockResult = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 30,
                    currentPage: 3,
                    totalPages: 3,
                    nextPage: null,
                    prevPage: 2,
                },
                certificates: expect.any(Array),
            };

            Certificate.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await CertificateService.getMany(mockData);

            expect(Certificate.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(expect.objectContaining(mockResult));
        });

        it('should return certificate data with page 2', async () => {
            const mockData = {
                page: 2,
                limit: 10,
                sort: '-issuedAt',
                type: 'Course',
            };
            const mockCount = 30;
            const mockResult = {
                pagination: {
                    currentRecords: 10,
                    totalRecords: 30,
                    currentPage: 2,
                    totalPages: 3,
                    nextPage: 3,
                    prevPage: 1,
                },
                certificates: expect.any(Array),
            };

            Certificate.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: mockRows,
            });

            const result = await CertificateService.getMany(mockData);

            expect(Certificate.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(expect.objectContaining(mockResult));
        });

        it('should return empty certificate data when page out of bound', async () => {
            const mockData = {
                page: 7,
                limit: 10,
                sort: '-issuedAt',
                type: 'Course',
            };
            const mockCount = 30;
            const mockResult = {
                pagination: {
                    currentRecords: 0,
                    totalRecords: 30,
                    currentPage: 7,
                    totalPages: 3,
                    nextPage: null,
                    prevPage: null,
                },
                certificates: expect.any(Array),
            };

            Certificate.findAndCountAll.mockResolvedValue({
                count: mockCount,
                rows: [],
            });

            const result = await CertificateService.getMany(mockData);

            expect(Certificate.findAndCountAll).toHaveBeenCalledWith(
                expect.any(Object),
            );
            expect(result).toEqual(expect.objectContaining(mockResult));
        });
    });

    describe('getOne', () => {
        const mockCertificates = [
            {
                id: 1,
                userId: 1,
                enrollmentId: 1,
                title: 'title',
                credential: 'CRS0001-U0001',
                documentUrl: 'https://certificate.com/cert.pdf',
                issuedAt: Date.now(),
                expiredAt: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                enrollment: {
                    programId: 1,
                    program: {
                        title: 'title',
                        type: 'type',
                        thumbnailUrl: 'https://thumbnail.com/thumb.webp',
                    },
                },
            },
            {
                id: 1,
                userId: 1,
                enrollmentId: 1,
                title: 'title',
                credential: 'CRS0001-U0001',
                documentUrl: 'https://certificate.com/cert.pdf',
                issuedAt: Date.now(),
                expiredAt: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                enrollment: {
                    programId: 1,
                },
            },
            {
                id: 1,
                userId: 1,
                enrollmentId: 1,
                title: 'title',
                credential: 'CRS0001-U0001',
                documentUrl: 'https://certificate.com/cert.pdf',
                issuedAt: Date.now(),
                expiredAt: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        it('should return a certificate', async () => {
            const mockCertificateId = 1;
            const mockResult = {
                id: mockCertificates[0].id,
                userId: mockCertificates[0].userId,
                enrollmentId: mockCertificates[0].enrollmentId,
                programId: mockCertificates[0].enrollment?.programId,
                programTitle: mockCertificates[0].enrollment?.program?.title,
                programType: mockCertificates[0].enrollment?.program?.type,
                programThumbnailUrl:
                    mockCertificates[0].enrollment?.program?.thumbnailUrl,
                title: mockCertificates[0].title,
                credential: mockCertificates[0].credential,
                documentUrl: mockCertificates[0].documentUrl,
                issuedAt: mockCertificates[0].issuedAt,
                expiredAt: mockCertificates[0].issuedAt,
                createdAt: mockCertificates[0].createdAt,
                updatedAt: mockCertificates[0].updatedAt,
            };
            Certificate.findByPk.mockResolvedValue(mockCertificates[0]);

            const result = await CertificateService.getOne(mockCertificateId);

            expect(Certificate.findByPk).toHaveBeenCalledWith(
                mockCertificateId,
                expect.any(Object),
            );
            expect(result).toEqual(expect.objectContaining(mockResult));
        });

        it('should return an orphan certificate without program', async () => {
            const mockCertificateId = 2;
            const mockResult = {
                id: mockCertificates[1].id,
                userId: mockCertificates[1].userId,
                enrollmentId: mockCertificates[1].enrollmentId,
                programId: mockCertificates[1].enrollment?.programId,
                programTitle: mockCertificates[1].enrollment?.program?.title,
                programType: mockCertificates[1].enrollment?.program?.type,
                programThumbnailUrl:
                    mockCertificates[1].enrollment?.program?.thumbnailUrl,
                title: mockCertificates[1].title,
                credential: mockCertificates[1].credential,
                documentUrl: mockCertificates[1].documentUrl,
                issuedAt: mockCertificates[1].issuedAt,
                expiredAt: mockCertificates[1].issuedAt,
                createdAt: mockCertificates[1].createdAt,
                updatedAt: mockCertificates[1].updatedAt,
            };
            Certificate.findByPk.mockResolvedValue(mockCertificates[1]);

            const result = await CertificateService.getOne(
                mockCertificateId,
                expect.any(Object),
            );

            expect(Certificate.findByPk).toHaveBeenCalledWith(
                mockCertificateId,
                expect.any(Object),
            );
            expect(result).toEqual(expect.objectContaining(mockResult));
        });

        it('should return an orphan certificate without enrollment and program', async () => {
            const mockCertificateId = 3;
            const mockResult = {
                id: mockCertificates[2].id,
                userId: mockCertificates[2].userId,
                enrollmentId: mockCertificates[2].enrollmentId,
                programId: mockCertificates[2].enrollment?.programId,
                programTitle: mockCertificates[2].enrollment?.program?.title,
                programType: mockCertificates[2].enrollment?.program?.type,
                programThumbnailUrl:
                    mockCertificates[2].enrollment?.program?.thumbnailUrl,
                title: mockCertificates[2].title,
                credential: mockCertificates[2].credential,
                documentUrl: mockCertificates[2].documentUrl,
                issuedAt: mockCertificates[2].issuedAt,
                expiredAt: mockCertificates[2].issuedAt,
                createdAt: mockCertificates[2].createdAt,
                updatedAt: mockCertificates[2].updatedAt,
            };
            Certificate.findByPk.mockResolvedValue(mockCertificates[2]);

            const result = await CertificateService.getOne(
                mockCertificateId,
                expect.any(Object),
            );

            expect(Certificate.findByPk).toHaveBeenCalledWith(
                mockCertificateId,
                expect.any(Object),
            );
            expect(result).toEqual(expect.objectContaining(mockResult));
        });

        it('should throw 404 error when certificate does not exist', async () => {
            const mockCertificateId = 404;
            const mockError = new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Certificate with "certificateId" does not exist',
                    context: {
                        key: 'certificateId',
                        value: mockCertificateId,
                    },
                },
            ]);
            Certificate.findByPk.mockResolvedValue(null);

            await expect(
                CertificateService.getOne(mockCertificateId),
            ).rejects.toThrow(mockError);

            expect(Certificate.findByPk).toHaveBeenCalledWith(
                mockCertificateId,
                expect.any(Object),
            );
        });
    });

    describe('getOwnerId', () => {
        it('should return userId', async () => {
            const mockCertificateId = 1;
            const mockCertificate = {
                enrollment: {
                    userId: 1,
                },
            };
            Certificate.findByPk.mockResolvedValue(mockCertificate);

            const result =
                await CertificateService.getOwnerId(mockCertificateId);

            expect(Certificate.findByPk).toHaveBeenCalledWith(
                mockCertificateId,
                expect.any(Object),
            );
            expect(result).toEqual(1);
        });

        it('should return null when certificate does not exist', async () => {
            const mockCertificateId = 404;
            Certificate.findByPk.mockResolvedValue(null);

            const result =
                await CertificateService.getOwnerId(mockCertificateId);

            expect(Certificate.findByPk).toHaveBeenCalledWith(
                mockCertificateId,
                expect.any(Object),
            );
            expect(result).toEqual(null);
        });
    });

    describe('create', () => {
        const mockEnrollment = {
            id: 1,
            userId: 1,
            status: 'Completed',
            program: {
                id: 1,
                title: 'Test Program',
                type: 'Course',
            },
            user: {
                id: 1,
                fullName: 'John Doe',
            },
            certificate: null,
        };

        const mockPdfBuffer = Buffer.from('test-pdf');

        beforeEach(() => {
            printPdf.mockResolvedValue(mockPdfBuffer);
            Upload.mockImplementation(() => {
                return {
                    done: () => {
                        return Promise.resolve({
                            Location:
                                'https://s3.amazonaws.com/bucket/test.pdf',
                        });
                    },
                };
            });
            Certificate.create.mockResolvedValue({
                toJSON: () => {
                    return { id: 1, title: 'Test Certificate' };
                },
            });
        });

        it('should create a certificate successfully', async () => {
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);

            const result = await CertificateService.create({
                enrollmentId: 1,
                issuedAt: faker.date.soon(),
            });

            expect(Enrollment.findByPk).toHaveBeenCalledWith(
                1,
                expect.any(Object),
            );
            expect(printPdf).toHaveBeenCalled();
            expect(Upload).toHaveBeenCalled();
            expect(Certificate.create).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it('should create a certificate successfully over an expired existing certificate', async () => {
            const expiredAt = faker.date.past();
            Enrollment.findByPk.mockResolvedValue({
                ...mockEnrollment,
                certificate: {
                    expiredAt,
                },
            });

            const result = await CertificateService.create({
                enrollmentId: 1,
                issuedAt: faker.date.past({ refDate: expiredAt }),
            });

            expect(Enrollment.findByPk).toHaveBeenCalledWith(
                1,
                expect.any(Object),
            );
            expect(printPdf).toHaveBeenCalled();
            expect(Upload).toHaveBeenCalled();
            expect(Certificate.create).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it('should throw 404 if enrollment not found', async () => {
            Enrollment.findByPk.mockResolvedValue(null);

            await expect(
                CertificateService.create({
                    enrollmentId: 999,
                    issuedAt: faker.date.soon(),
                }),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Enrollment with "enrollmentId" does not exist',
                        context: { key: 'enrollmentId', value: 999 },
                    },
                ]),
            );
        });

        it('should throw 409 if an active certificate already exists', async () => {
            Enrollment.findByPk.mockResolvedValue({
                ...mockEnrollment,
                certificate: { expiredAt: null },
            });

            await expect(
                CertificateService.create({
                    enrollmentId: 1,
                    issuedAt: faker.date.soon(),
                }),
            ).rejects.toThrow(
                new HTTPError(409, 'Resource conflict.', [
                    {
                        message:
                            'Enrollment with "enrollmentId" already has an active certificate',
                        context: { key: 'enrollmentId', value: 1 },
                    },
                ]),
            );
        });

        it('should throw 400 if enrollment is not completed', async () => {
            Enrollment.findByPk.mockResolvedValue({
                ...mockEnrollment,
                status: 'In Progress',
            });

            await expect(
                CertificateService.create({
                    enrollmentId: 1,
                    issuedAt: faker.date.soon(),
                }),
            ).rejects.toThrow(
                new HTTPError(400, 'Validation error.', [
                    {
                        message: 'Enrollment "status" must be "Completed"',
                        context: { key: 'status', value: 'In Progress' },
                    },
                ]),
            );
        });

        it('should create a certificate with a custom title', async () => {
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);
            const customTitle = 'Custom Certificate Title';

            await CertificateService.create({
                enrollmentId: 1,
                title: customTitle,
                issuedAt: faker.date.soon(),
            });

            expect(Certificate.create).toHaveBeenCalledWith(
                expect.objectContaining({ title: customTitle }),
            );
        });

        it('should handle different program types for credential prefix', async () => {
            const programTypes = ['Seminar', 'Competition', 'Workshop'];
            const credentialPrefixes = ['SMN', 'CMP', 'WRS'];

            for (let i = 0; i < programTypes.length; i++) {
                Enrollment.findByPk.mockResolvedValue({
                    ...mockEnrollment,
                    program: {
                        ...mockEnrollment.program,
                        type: programTypes[i],
                    },
                });

                await CertificateService.create({
                    enrollmentId: 1,
                    issuedAt: faker.date.soon(),
                });

                expect(Certificate.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        credential: expect.stringContaining(
                            credentialPrefixes[i],
                        ),
                    }),
                );
            }
        });

        it('should create a certificate with an expiry date', async () => {
            Enrollment.findByPk.mockResolvedValue(mockEnrollment);
            const issuedAt = faker.date.soon();
            const expiredAt = faker.date.future({ refDate: issuedAt });

            await CertificateService.create({
                enrollmentId: 1,
                issuedAt,
                expiredAt,
            });

            expect(Certificate.create).toHaveBeenCalledWith(
                expect.objectContaining({ expiredAt }),
            );
        });
    });

    describe('updateOne', () => {
        const mockPdfBuffer = Buffer.from('updated-pdf-content');
        const mockCertificate = {
            id: 1,
            title: 'Old Title',
            issuedAt: '2025-01-01T00:00:00.000Z',
            credential: 'CRS0001-U0001',
            enrollment: {
                user: { fullName: 'John Doe' },
                program: { title: 'Test Program', type: 'Course' },
            },
        };

        beforeEach(() => {
            printPdf.mockResolvedValue(mockPdfBuffer);
            Upload.mockImplementation(() => {
                return {
                    done: () => {
                        return Promise.resolve({
                            Location:
                                'https://s3.amazonaws.com/bucket/updated.pdf',
                        });
                    },
                };
            });
            Certificate.update.mockResolvedValue([
                1,
                [
                    {
                        toJSON: () => {
                            return {
                                id: 1,
                                title: 'New Title',
                                expiredAt: '2026-01-01T00:00:00.000Z',
                            };
                        },
                    },
                ],
            ]);
        });

        it('should update a certificate title and expiredAt successfully', async () => {
            Certificate.findByPk.mockResolvedValue(mockCertificate);
            const updateData = {
                title: 'New Title',
                expiredAt: '2026-01-01T00:00:00.000Z',
            };

            const result = await CertificateService.updateOne({
                certificateId: 1,
                updateData,
            });

            expect(Certificate.findByPk).toHaveBeenCalledWith(
                1,
                expect.any(Object),
            );
            expect(printPdf).toHaveBeenCalled();
            expect(Upload).toHaveBeenCalled();
            expect(Certificate.update).toHaveBeenCalled();
            expect(result.title).toBe('New Title');
            expect(result.expiredAt).toBe('2026-01-01T00:00:00.000Z');
        });

        it('should throw 404 if certificate is not found', async () => {
            Certificate.findByPk.mockResolvedValue(null);

            await expect(
                CertificateService.updateOne({
                    certificateId: 999,
                    updateData: { title: 'New Title' },
                }),
            ).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Certificate with "certificateId" does not exist',
                        context: { key: 'certificateId', value: 999 },
                    },
                ]),
            );
        });

        it('should throw 400 if expiredAt is earlier than issuedAt', async () => {
            Certificate.findByPk.mockResolvedValue(mockCertificate);
            const updateData = {
                expiredAt: '2024-12-31T00:00:00.000Z',
            };

            await expect(
                CertificateService.updateOne({
                    certificateId: 1,
                    updateData,
                }),
            ).rejects.toThrow(
                new HTTPError(400, 'Validation error.', [
                    {
                        message:
                            'Certificate "expiredAt" cannot be earlier than "issuedAt"',
                        context: {
                            key: 'expiredAt',
                            value: updateData.expiredAt,
                        },
                    },
                ]),
            );
        });

        it('should handle updates with only a title', async () => {
            Certificate.findByPk.mockResolvedValue(mockCertificate);
            const updateData = { title: 'Only Title Updated' };
            Certificate.update.mockResolvedValue([
                1,
                [
                    {
                        toJSON: () => {
                            return {
                                id: 1,
                                title: 'Only Title Updated',
                            };
                        },
                    },
                ],
            ]);

            const result = await CertificateService.updateOne({
                certificateId: 1,
                updateData,
            });

            expect(printPdf).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'Only Title Updated' }),
                expect.any(Array),
            );
            expect(result.title).toBe('Only Title Updated');
        });

        it('should handle updates with only an expiredAt date', async () => {
            Certificate.findByPk.mockResolvedValue({
                ...mockCertificate,
                expiredAt: null,
            });
            const updateData = { expiredAt: '2027-01-01T00:00:00.000Z' };
            Certificate.update.mockResolvedValue([
                1,
                [
                    {
                        toJSON: () => {
                            return {
                                id: 1,
                                expiredAt: '2027-01-01T00:00:00.000Z',
                            };
                        },
                    },
                ],
            ]);

            const result = await CertificateService.updateOne({
                certificateId: 1,
                updateData,
            });

            expect(printPdf).toHaveBeenCalledWith(
                expect.objectContaining({
                    expiredAt: expect.stringContaining('2027'),
                }),
                expect.any(Array),
            );
            expect(result.expiredAt).toBe('2027-01-01T00:00:00.000Z');
        });
    });

    describe('deleteOne', () => {
        it('should delete a certificate and its document from S3', async () => {
            const mockCertificate = {
                id: 1,
                documentUrl:
                    'https://s3.amazonaws.com/bucket/documents/certificates/CERT-123.pdf',
            };
            Certificate.findByPk.mockResolvedValue(mockCertificate);
            Certificate.destroy.mockResolvedValue(1);

            await CertificateService.deleteOne(1);

            expect(Certificate.findByPk).toHaveBeenCalledWith(1);
            expect(s3.send).toHaveBeenCalledWith(
                expect.any(DeleteObjectCommand),
            );
            expect(DeleteObjectCommand).toHaveBeenCalledWith({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: 'documents/certificates/CERT-123.pdf',
            });
            expect(Certificate.destroy).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('should delete a certificate without a documentUrl', async () => {
            const mockCertificate = {
                id: 2,
                documentUrl: null,
            };
            Certificate.findByPk.mockResolvedValue(mockCertificate);
            Certificate.destroy.mockResolvedValue(1);

            await CertificateService.deleteOne(2);

            expect(Certificate.findByPk).toHaveBeenCalledWith(2);
            expect(s3.send).not.toHaveBeenCalled();
            expect(Certificate.destroy).toHaveBeenCalledWith({
                where: { id: 2 },
            });
        });

        it('should throw a 404 error if the certificate does not exist', async () => {
            Certificate.findByPk.mockResolvedValue(null);

            await expect(CertificateService.deleteOne(999)).rejects.toThrow(
                new HTTPError(404, 'Resource not found.', [
                    {
                        message:
                            'Certificate with "certificateId" does not exist',
                        context: { key: 'certificateId', value: 999 },
                    },
                ]),
            );

            expect(Certificate.findByPk).toHaveBeenCalledWith(999);
            expect(Certificate.destroy).not.toHaveBeenCalled();
        });
    });
});
