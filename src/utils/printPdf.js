const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { createPdf } = require('../apis/docRaptor.api');

/**
 * Generates a PDF buffer from an HTML handlebars template.
 * @param {object} data - The data to populate the template.
 * @param {string[]} templatePaths - Path segments to the template file, relative to the utils directory.
 * @param {string} encoding - The file encoding.
 * @returns {Promise<Buffer>} A buffer containing the generated PDF file.
 */
module.exports = async (data, templatePaths, encoding = 'utf-8') => {
    const templateSource = fs.readFileSync(
        path.join(__dirname, ...templatePaths),
        encoding,
    );

    const template = handlebars.compile(templateSource);
    const html = template(data);
    const pdfBuffer = await createPdf(html);

    return pdfBuffer;
};
