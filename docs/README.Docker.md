# Comprehensive Guide to Running with Docker

Using Docker is the **highly recommended** way to run this project for both development and production. It provides a consistent, isolated, and reproducible environment by automatically setting up and configuring all required services, including the PostgreSQL database, Redis cache, and MinIO object storage.

## Core Concepts: The Docker Services

Our `compose.yaml` file defines the following services that work together to run the application:

| Service | Description | Internal Hostname |
| :--- | :--- | :--- |
| **`api`** | The Node.js application itself. This is where our back-end code runs. | `api` |
| **`db`** | The PostgreSQL database service for storing all persistent data. | `db` |
| **`cache`** | The Redis service used for caching and managing JWT blocklists. | `cache` |
| **`s3`** | The MinIO service, which provides an S3-compatible object storage API. | `s3` |
| **`minio-mc`**| A helper service that waits for MinIO to be ready and then creates our storage bucket (`S3_BUCKET_NAME`) and sets its access policy to public. | `minio-mc`|

---

## Part 1: Local Development Setup

Follow these steps to get a fully containerized development environment running on your local machine.

### Prerequisites

*   **Docker Engine**: Make sure the Docker daemon is running.
*   **Docker Compose**: Included with most Docker Desktop installations.

### Step 1: Environment Configuration

The application is configured using environment variables. Instead of managing system-wide variables, we use a `.env` file.

1.  **Create the File**: Create a new file named `.env` in the root of the project.
2.  **Copy from Example**: Copy the entire contents of `.env.example` and paste them into your new `.env` file.
3.  **Update the Values**: Fill in the required values. **Pay close attention to the variables below**, as they are critical for a Docker setup.

#### Critical Docker Environment Variables

While you should review all variables, these are the most important ones for Docker. Note how the hostnames match the service names from the `compose.yaml` file.

```dotenv
# .env (Sample for Docker)

# PostgreSQL (connects to the 'db' service in compose.yaml)
DATABASE_URL="postgresql://postgres:your_super_secret_password@db:5432/sim_ilc"

# Redis (connects to the 'cache' service in compose.yaml)
REDIS_URL="redis://default:your_secure_redis_password@cache:6379/0"

# S3 (connects to the 's3' service for internal API access)
# S3_ENDPOINT is used by the API service (server-to-server).
S3_ENDPOINT=http://s3:9000
# S3_PUBLIC_ENDPOINT is used by the client/browser to fetch files.
# It must point to the host machine's address where MinIO is exposed.
S3_PUBLIC_ENDPOINT=http://localhost:9000

# MinIO Credentials (used by the 's3' and 'minio-mc' services)
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

> **IMPORTANT: Generate New Secrets!**
> Do not use the example passwords or JWT secrets in the `.env.example` file. Generate your own secure, random values for:
> *   `POSTGRES_PASSWORD` (in the `DATABASE_URL`)
> *   `REDIS_PASSWORD` (in the `REDIS_URL`)
> *   `JWT_SECRET_KEY` (generate with `openssl rand -hex 32`)

### Step 2: Initial Build and Startup

With your `.env` file configured, run the following command from the project root:

```bash
docker compose up -d --build
```

*   `--build`: This flag tells Docker Compose to build the `api` image from the `Dockerfile` before starting the services. You only need to do this the first time or after changing dependencies in `package.json` or modifying the `Dockerfile`.
*   `-d` (Detached Mode): This runs the containers in the background and leaves your terminal free.

### Step 3: Accessing Services

Once the containers are running, you can access the services at their exposed ports:

*   **API Server**: [http://localhost:8080](http://localhost:8080)
*   **API Documentation (Swagger)**: [http://localhost:8080/api/v1/docs](http://localhost:8080/api/v1/docs)
*   **MinIO S3 Console**: [http://localhost:9001](http://localhost:9001) (Log in with the `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` from your `.env` file).
*   **PostgreSQL Database**: Exposed at `localhost:5433` if you wish to connect with an external GUI tool.

---

## Part 2: Day-to-Day Development

Here are the most common commands you'll use while developing.

### Starting and Stopping

*   **To start all services** (without rebuilding):
    ```bash
    docker compose up -d
    ```

*   **To stop all services**:
    ```bash
    docker compose down
    ```

*   **To stop and remove persistent data** (like database contents):
    ```bash
    docker compose down --volumes
    ```

### Viewing Logs

To see the real-time output from a specific service, use `logs`:

```bash
# View logs for the API server
docker compose logs -f api

# View logs for the database
docker compose logs -f db
```

### Running Commands Inside a Container

You can execute any command inside a running container using `docker compose exec`. This is essential for database management and other tasks.

*   **Run Database Migrations:**
    ```bash
    docker compose exec api npm run db:migrate
    ```

*   **Run Database Seeders:**
    ```bash
    docker compose exec api npm run db:seed:all
    ```
*   **Open an Interactive Shell** inside the `api` container:
    ```bash
    docker compose exec api bash
    ```

---

## Part 3: Guide to Production Deployment

Deploying a Dockerized application to production requires a shift in mindset from local development. **It is not recommended to run stateful services like your primary database in a Docker container in production** without a robust, managed backup and data persistence strategy.

### Production Philosophy

1.  **Use Managed Services for Stateful Data**: For your database and Redis cache, use a managed cloud service like:
    *   **Database**: Amazon RDS, Google Cloud SQL, or DigitalOcean Managed PostgreSQL.
    *   **Redis**: Amazon ElastiCache, Google Memorystore, or a similar service.
    This offloads the responsibility of backups, scaling, and maintenance.

2.  **Containerize Your Stateless Application**: Your Node.js `api` service is stateless, making it a perfect candidate for containerization. It can be easily scaled horizontally.

3.  **Securely Manage Secrets**: Do not commit `.env` files to your repository or include them in your Docker image. Use your cloud provider's integrated secret management service (e.g., AWS Secrets Manager, Google Secret Manager) to inject environment variables at runtime.

### Deployment Steps

1.  **Build a Production-Ready Image**: Create a Docker image optimized for production. It's best practice to build for a specific architecture, like `linux/amd64`.
    ```bash
    # Build for a specific platform and tag it for your registry
    docker buildx build --platform=linux/amd64 -t your-registry.com/sim-ilc-api:latest .
    ```

2.  **Push to a Container Registry**: Push your tagged image to a private container registry.
    ```bash
    docker push your-registry.com/sim-ilc-api:latest
    ```
    Examples of registries include Docker Hub, Amazon ECR, and Google Artifact Registry.

3.  **Deploy to a Cloud Service**: Deploy the image from your registry to a container orchestration service.
    *   **Examples**: AWS ECS, Google Cloud Run, Azure Container Apps, or DigitalOcean App Platform.
    *   **Configuration**: In your chosen cloud service, configure the deployment to:
        *   Pull the image from your registry.
        *   Inject the production environment variables (database URLs, API keys, etc.) securely.
        *   Set up networking, auto-scaling, and health checks.

---

## Troubleshooting

*   **Error: "Port is already allocated"**:
    This means another process on your host machine is using a port that Docker is trying to map. You can either stop the other process or change the port mapping in `compose.yaml`. For example, to change the API server from `8080` to `8888`:
    ```yaml
    # compose.yaml
    services:
      api:
        ports:
          - "8888:8080" # Host:Container
    ```

*   **Permission Denied on Linux**:
    If you get permission errors running `docker` commands, you may need to add your user to the `docker` group: `sudo usermod -aG docker $USER`. You will need to log out and log back in for this to take effect.

*   **Build Fails**:
    Check for network issues that might prevent `npm install` from completing. Ensure you have a valid `package.json` and `package-lock.json`. You can try cleaning your Docker build cache with `docker builder prune`.
