const { docRaptor } = require('../configs/docRaptor');
const HTTPError = require('../utils/httpError');

/**
 * Calls the DocRaptor API to create a PDF from HTML content.
 * @param {string} htmlContent - The HTML content to be converted to a PDF.
 * @returns {Promise<Buffer>} A buffer containing the generated PDF file.
 */
const createPdf = async (htmlContent) => {
    try {
        const response = await docRaptor.post(
            '/docs',
            {
                test: process.env.NODE_ENV !== 'production',
                document_content: htmlContent,
                document_type: 'pdf',
                prince_options: {
                    media: 'print',
                },
            },
            {
                responseType: 'arraybuffer',
            },
        );

        return response.data;
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error(
                '[DocRaptor Error]',
                err.response ? err.response.data.toString() : err.message,
            );
        }

        throw new HTTPError(502, 'Bad Gateway.', [
            {
                message: 'There is an error with external calls',
            },
        ]);
    }
};

module.exports = {
    createPdf,
};
