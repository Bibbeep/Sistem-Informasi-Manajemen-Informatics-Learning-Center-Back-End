const {
    S3Client,
    CreateBucketCommand,
    PutBucketPolicyCommand,
    HeadBucketCommand,
} = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_TEST_BUCKET_NAME;

const bucketExists = async () => {
    try {
        await s3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        return true;
    } catch (err) {
        if (err.name === 'NotFound') {
            return false;
        }
        throw err;
    }
};

const createPublicTestBucket = async () => {
    try {
        if (!(await bucketExists())) {
            await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        }

        const bucketPolicy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicRead',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
                },
            ],
        };

        await s3.send(
            new PutBucketPolicyCommand({
                Bucket: BUCKET_NAME,
                Policy: JSON.stringify(bucketPolicy),
            }),
        );
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
            console.log(err);
        }
    }
};

module.exports = { createPublicTestBucket };
