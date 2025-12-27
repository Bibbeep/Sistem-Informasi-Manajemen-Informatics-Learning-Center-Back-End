# Use the official MinIO image as a base
FROM minio/minio:RELEASE.2025-09-07T16-13-09Z

# Copy the entrypoint script into the container
COPY entrypoint.sh /usr/bin/

# Make the entrypoint script executable
RUN chmod +x /usr/bin/entrypoint.sh

# Set the entrypoint for the container
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
