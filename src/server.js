const { app } = require('./app');
const { connectDb } = require('./configs/database');
const { connectRedis } = require('./configs/redis');
const { connectNodemailer } = require('./configs/nodemailer');
/* istanbul ignore next */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
    await connectDb();
    await connectRedis();
    await connectNodemailer();
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = { server };
