Running with Docker
===================

Using Docker is the recommended way to run this project for both development and production, as it automatically sets up and configures all required services (PostgreSQL, Redis, and MinIO).

### Prerequisites

*   **Docker** and **Docker Compose**
    

### 1\. Configure the Environment

The application is configured using environment variables.

1.  Create a file named `.env.production` in the root of the project.
    
2.  Copy the contents of the `.env.example` file into your new `.env.production` file.
    
3.  Fill in the required values. Note the specific hostnames for `POSTGRES_HOST`, `REDIS_HOST`, and `S3_ENDPOINT` which point to the service names in the `compose.yaml` file.
    

#### Sample `.env.production`

    # Server
    NODE_ENV=production
    PORT=3000
    HOST_NAME=http://localhost
    
    # Client
    CORS_ORIGIN=http://localhost:5173
    
    # PostgreSQL (connects to the 'db' service in compose.yaml)
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=your_super_secret_password
    POSTGRES_DB=sim_ilc
    POSTGRES_HOST=db
    POSTGRES_PORT=5432
    
    # JWT
    # Generate a secure key with: openssl rand -hex 32
    JWT_SECRET_KEY=56e5b2fac2509fcf63e71274eca844137507d65393769fd1af7d4ea0a92247c3
    JWT_EXP="7d"
    
    # Redis (connects to the 'cache' service in compose.yaml)
    REDIS_USER=default
    REDIS_PASSWORD=your_secure_redis_password
    REDIS_DB=1
    REDIS_HOST=cache
    REDIS_PORT=6379
    
    # Nodemailer (using Gmail)
    # See the main README for how to get an App Password
    NODEMAILER_SERVICE="gmail"
    NODEMAILER_USER="your_email@gmail.com"
    NODEMAILER_PASS="your_gmail_app_password"
    
    # S3 (connects to the 's3' service in compose.yaml)
    S3_REGION=us-east-1
    S3_ENDPOINT=http://s3:9000
    S3_ACCESS_KEY_ID=minioadmin
    S3_SECRET_ACCESS_KEY=minioadmin
    S3_BUCKET_NAME=sim-ilc
    S3_TEST_BUCKET_NAME=sim-ilc-test
    

**Note on S3 Endpoints:**

*   `S3_ENDPOINT=http://s3:9000` is the **internal** address used by the API container to communicate with the MinIO container.
    

### 2\. Build and Run the Containers

When you're ready, start all services by running the following command from the project root:

```bash
APP_VERSION=$(npm pkg get version --json | jq -r .) docker compose --env-file .env.production up -d --build
```


This command will:

*   Build the Docker image for the API service.
    
*   Start the API, PostgreSQL, Redis, and MinIO containers in detached mode.
    
*   Automatically create the database and run migrations upon startup.
    
*   Automatically create the MinIO bucket and set its policy to public-read.
    

### Accessing Services

Once the containers are running, you can access the services at the following addresses:

*   **API Server**: [http://localhost:3000](http://localhost:3000)
    
*   **API Documentation (Swagger)**: [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)
    
*   **MinIO S3 Console**: [http://localhost:9001](http://localhost:9001) (Log in with `minioadmin`/`minioadmin`)
    

### Stopping the Services

To stop all running containers, use:

```bash
docker compose down

# Delete volumes and containers as well
docker compose down --volumes --remove-orphans
```

    

Deploying to the Cloud
----------------------

1.  **Build your image**, targeting the CPU architecture of your cloud provider if it's different from your development machine.
    
    ```bash
    # Example for an amd64 server
    docker build --platform=linux/amd64 -t your-registry.com/sim-ilc-api
    ```
        
    
2.  **Push the image** to your container registry.
    
    ```bash
    docker push your-registry.com/sim-ilc-api
    ```

    
3.  **Deploy** the image from your registry to your cloud service (e.g., AWS ECS, Google Cloud Run, DigitalOcean Apps). Ensure you configure the same environment variables in your cloud environment.
    

### References

*   [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
    
*   [Docker's getting started guide for sharing images](https://docs.docker.com/go/get-started-sharing/)