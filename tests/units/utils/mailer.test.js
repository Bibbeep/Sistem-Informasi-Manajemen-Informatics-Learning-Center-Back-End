/* eslint-disable no-undef */
jest.mock('../../../src/configs/nodemailer');
const mailer = require('../../../src/utils/mailer');
const { transporter } = require('../../../src/configs/nodemailer');

describe('Mailer Utility Unit Tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env.NODEMAILER_USER = 'admin@similc.ac.id';
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = originalEnv;
    });

    it('should call sendMail and throw no error', async () => {
        const mockData = {
            to: 'johndoe@mail.com',
            subject: 'Test Mail',
            text: 'This is a test mail. :)',
            html: '<p>Hello World!<p>',
        };
        transporter.sendMail.mockResolvedValue();

        await mailer(
            mockData.to,
            mockData.subject,
            mockData.text,
            mockData.html,
        );

        expect(transporter.sendMail).toHaveBeenCalledWith({
            ...mockData,
            from: `"Informatics Learning Center Team" <${process.env.NODEMAILER_USER}>`,
        });
        expect(mailer).not.toThrow();
    });

    it('should return error if Nodemailer fails', async () => {
        const mockData = {
            to: 'johndoe@mail.com',
            subject: 'Test Mail',
            text: 'This is a test mail. :)',
            html: '<p>Hello World!<p>',
        };
        const mockError = new Error();
        transporter.sendMail.mockRejectedValue(mockError);

        const result = await mailer(
            mockData.to,
            mockData.subject,
            mockData.text,
            mockData.html,
        );

        expect(transporter.sendMail).toHaveBeenCalledWith({
            ...mockData,
            from: `"Informatics Learning Center Team" <${process.env.NODEMAILER_USER}>`,
        });
        expect(result).toBe(mockError);
    });
});
