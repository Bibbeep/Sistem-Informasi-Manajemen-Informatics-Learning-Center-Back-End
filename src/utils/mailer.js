const { transporter } = require('../configs/nodemailer');

module.exports = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: `"Informatics Learning Center Team" <${process.env.NODEMAILER_USER}>`,
            to,
            subject,
            text,
            html,
        });
    } catch (err) {
        return err;
    }
};
