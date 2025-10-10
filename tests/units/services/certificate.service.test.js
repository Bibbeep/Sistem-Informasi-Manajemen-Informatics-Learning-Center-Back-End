/* eslint-disable no-undef */
jest.mock('../../../src/db/models');
const { Certificate } = require('../../../src/db/models');
const CertificateService = require('../../../src/services/certificate.service');

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
});
