if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const nodemailer = require('nodemailer');
const chalk = require('chalk');

const transportConfig = {
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: process.env.SMTP_SECURE === 'true' ? true : false,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
    debug: process.env.NODE_ENV === 'development' ? true : false,
    logger: process.env.NODE_ENV === 'development' ? true : false,
};

const transporter = nodemailer.createTransport(transportConfig);

const connectNodemailer = async () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(
            chalk.yellow('[Nodemailer]'),
            'Checking mailer service connection...',
        );
    }

    try {
        await transporter.verify();
        if (process.env.NODE_ENV !== 'test') {
            console.log(chalk.yellow('[Nodemailer]'), 'Nodemailer is ready');
        }
    } catch (err) {
        console.log(
            chalk.red('[Nodemailer]'),
            'Failed to connect to the server. Error:',
            err,
        );
        process.exit(1);
    }
};

module.exports = {
    transporter,
    connectNodemailer,
};
