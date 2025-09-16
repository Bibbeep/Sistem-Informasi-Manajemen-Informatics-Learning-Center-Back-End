if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});

const connectNodemailer = async () => {
    console.log('[Nodemailer] Checking mailer service connection...');

    try {
        await transporter.verify();
        console.log('[Nodemailer] Nodemailer is ready');
    } catch (err) {
        console.log(
            '[Nodemailer] Failed to connect to the server. Error:',
            err,
        );
        process.exit(1);
    }
};

module.exports = {
    transporter,
    connectNodemailer,
};
