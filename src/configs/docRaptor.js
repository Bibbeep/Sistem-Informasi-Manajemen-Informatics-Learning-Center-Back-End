const axios = require('axios');

const docRaptor = axios.create({
    baseURL: 'https://docraptor.com',
    headers: {
        Authorization: `Basic ${Buffer.from(
            `${process.env.DOCRAPTOR_API_KEY}:`,
        ).toString('base64')}`,
    },
});

module.exports = {
    docRaptor,
};
