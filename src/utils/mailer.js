const { transporter } = require('../configs/nodemailer');

module.exports = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: process.env.NODEMAILER_SENDER,
            to,
            subject,
            text,
            html,
        });
    } catch (err) {
        return err;
    }
};
