/* eslint-disable no-undef */
jest.mock('fs');
jest.mock('../../../src/apis/docRaptor.api.js');
const fs = require('fs');
const printPdf = require('../../../src/utils/printPdf');
const { createPdf } = require('../../../src/apis/docRaptor.api');
const HTTPError = require('../../../src/utils/httpError');

describe('printPdf Utility Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should read the template, compile it, and return a PDF buffer on success', async () => {
        const mockData = {
            title: 'Test Certificate',
            name: 'John Doe',
        };
        const mockTemplatePaths = [
            '..',
            'templates',
            'documents',
            'certificate.hbs',
        ];
        const mockTemplateContent =
            '<h1>{{title}}</h1><p>This is to certify that {{name}} has completed the course.</p>';
        const mockPdfBuffer = Buffer.from('mock-pdf-content');

        fs.readFileSync.mockReturnValue(mockTemplateContent);
        createPdf.mockResolvedValue(mockPdfBuffer);

        const result = await printPdf(mockData, mockTemplatePaths);

        expect(fs.readFileSync).toHaveBeenCalledWith(
            expect.any(String),
            'utf-8',
        );
        expect(createPdf).toHaveBeenCalledWith(
            expect.stringContaining(
                '<h1>Test Certificate</h1><p>This is to certify that John Doe has completed the course.</p>',
            ),
        );
        expect(result).toBeInstanceOf(Buffer);
        expect(result.toString()).toBe('mock-pdf-content');
    });

    it('should throw an error if createPdf fails', async () => {
        const mockData = {
            title: 'Test Certificate',
            name: 'John Doe',
        };
        const mockTemplatePaths = [
            '..',
            'templates',
            'documents',
            'certificate.hbs',
        ];
        const mockTemplateContent =
            '<h1>{{title}}</h1><p>This is to certify that {{name}} has completed the course.</p>';
        const mockError = new HTTPError(502, 'Bad Gateway.', [
            {
                message: 'There is an error with external calls',
            },
        ]);

        fs.readFileSync.mockReturnValue(mockTemplateContent);
        createPdf.mockRejectedValue(mockError);

        await expect(printPdf(mockData, mockTemplatePaths)).rejects.toThrow(
            mockError,
        );

        expect(fs.readFileSync).toHaveBeenCalledWith(
            expect.any(String),
            'utf-8',
        );
        expect(createPdf).toHaveBeenCalledWith(
            expect.stringContaining(
                '<h1>Test Certificate</h1><p>This is to certify that John Doe has completed the course.</p>',
            ),
        );
    });

    it('should handle different encodings', async () => {
        const mockData = {
            title: 'Test Certificate',
            name: 'John Doe',
        };
        const mockTemplatePaths = [
            '..',
            'templates',
            'documents',
            'certificate.hbs',
        ];
        const mockTemplateContent =
            '<h1>{{title}}</h1><p>This is to certify that {{name}} has completed the course.</p>';
        const mockPdfBuffer = Buffer.from('mock-pdf-content');

        fs.readFileSync.mockReturnValue(mockTemplateContent);
        createPdf.mockResolvedValue(mockPdfBuffer);

        await printPdf(mockData, mockTemplatePaths, 'latin1');

        expect(fs.readFileSync).toHaveBeenCalledWith(
            expect.any(String),
            'latin1',
        );
    });
});
