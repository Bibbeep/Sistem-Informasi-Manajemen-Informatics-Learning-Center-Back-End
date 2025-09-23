#!/bin/sh

minio server /data --console-address ":9001" &

until mc alias set local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}; do
    echo "Waiting for MinIO server to be ready..."
    sleep 1
done

mc mb local/${S3_BUCKET_NAME} --ignore-existing

mc anonymous set download local/${S3_BUCKET_NAME}

echo "✅ MinIO is ready, bucket '${S3_BUCKET_NAME}' created with download policy."

wait