if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const nodemailer = require('nodemailer');
const chalk = require('chalk');

const transportConfig =
    process.env.NODE_ENV === 'production'
        ? {
              service: process.env.NODEMAILER_SERVICE,
              auth: {
                  user: process.env.NODEMAILER_USER,
                  pass: process.env.NODEMAILER_PASS,
              },
          }
        : {
              host: process.env.NODEMAILER_HOST,
              port: process.env.NODEMAILER_PORT,
              secure: false,
              auth: {
                  user: process.env.NODEMAILER_USER,
                  pass: process.env.NODEMAILER_PASS,
              },
          };

const transporter = nodemailer.createTransport(transportConfig);

const connectNodemailer = async () => {
    console.log(
        chalk.yellow('[Nodemailer]'),
        'Checking mailer service connection...',
    );

    try {
        await transporter.verify();
        console.log(chalk.yellow('[Nodemailer]'), 'Nodemailer is ready');
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
