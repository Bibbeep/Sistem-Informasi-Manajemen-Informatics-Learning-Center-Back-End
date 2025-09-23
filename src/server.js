const chalk = require('chalk');
const { app } = require('./app');
const { connectDb } = require('./configs/database');
const { connectRedis } = require('./configs/redis');
const { connectNodemailer } = require('./configs/nodemailer');
const { connectS3 } = require('./configs/s3');
/* istanbul ignore next */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
    await connectDb();
    await connectRedis();
    await connectNodemailer();
    await connectS3();
    console.log(chalk.inverse.bold(`Server is listening on port ${PORT}`));
});

module.exports = { server };
