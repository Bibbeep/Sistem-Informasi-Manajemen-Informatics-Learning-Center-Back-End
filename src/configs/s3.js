const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const chalk = require('chalk');

const s3 = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

const connectS3 = async () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(chalk.green('[S3]'), 'Checking service connection...');
    }

    try {
        await s3.send(new ListBucketsCommand({}));
        if (process.env.NODE_ENV !== 'test') {
            console.log(chalk.green('[S3]'), 'S3 connection established');
        }
    } catch (err) {
        console.log(
            chalk.red('[S3]'),
            'Failed to connect to the server. Error:',
            err,
        );
        process.exit(1);
    }
};

module.exports = { s3, connectS3 };
