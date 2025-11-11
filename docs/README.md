Sistem Informasi Manajemen - Informatics Learning Center (SIM ILC) Back-End
===========================================================================

[![Unit Testing](https://github.com/Bibbeep/Sistem-Informasi-Manajemen-Informatics-Learning-Center-Back-End/actions/workflows/unit-test.yml/badge.svg)](https://github.com/Bibbeep/Sistem-Informasi-Manajemen-Informatics-Learning-Center-Back-End/actions/workflows/unit-test.yml)

[![Auto Deploy to Amazon EC2](https://github.com/Bibbeep/Sistem-Informasi-Manajemen-Informatics-Learning-Center-Back-End/actions/workflows/deploy.yml/badge.svg)](https://github.com/Bibbeep/Sistem-Informasi-Manajemen-Informatics-Learning-Center-Back-End/actions/workflows/deploy.yml)

This is the internal back-end service for the SIM ILC project, providing a robust API for managing users, programs, enrollments, payments, certificates, dicussions, and feedbacks. It's built with Node.js, Express, and Sequelize.

For a fully containerized setup using Docker, please see the [**Docker Setup Guide**](README.Docker.md).

*   [**Live API Documentation (Postman)**](https://documenter.getpostman.com/view/37947000/2sB3HtFGYu)
    

Features
--------

This project is designed to be a comprehensive management system for a learning center.

*   **User Authentication & Management**: Secure user registration, login (with JWT), password reset, and profile management.

*   **Program & Module Management**: Create, read, update, and delete learning programs (Courses, Seminars, Workshops) and their associated modules.
    
*   **Enrollment & Progress Tracking**: Allow users to enroll in programs and track their progress by marking modules as complete.
    
*   **Certificate Generation**: Automatically issue certificates to users upon completion of a program.
    
*   **Invoicing & Payments**: Generate invoices for paid programs and handle payment verification.
    
*   **Discussion Forums**: A complete forum system where users can post comments, reply to others, and like comments.
    
*   **User Feedback System**: Allow users to submit feedback and for admins to respond.
   
*   **Role-Based Access Control**: Differentiates between regular `User` and `Admin` roles, ensuring secure access to administrative endpoints.
    
*   **Secure File Uploads**: Supports profile photo uploads with type validation and image compression, storing files in an S3-compatible service.
    
*   **Containerized Environment**: Full support for Docker and Docker Compose, allowing for a consistent and reproducible development and production environment.
    

Getting Started: Local Development
----------------------------------

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes without using Docker.

### Prerequisites

You will need to have the following software installed on your machine:

*   **Node.js**: v22.19.0 or higher
    
*   **npm**: v10.8.1 or higher
    
*   **Git**
    
*   **PostgreSQL**: A running instance of PostgreSQL.
    
*   **Redis**: A running instance of Redis.
    
*   **MinIO**: A running instance of MinIO or another S3-compatible object storage service.
   
*   **DocRaptor API Key**: A third-party service for generating pdf.

*   **Mail service API Key**: A third-party service for sending emails.

### 1\. Clone & Install Dependencies

First, clone the repository to your local machine and install the necessary npm packages.

```bash
git clone https://github.com/Bibbeep/Sistem-Informasi-Manajemen-Informatics-Learning-Center-Back-End.git
cd Sistem-Informasi-Manajemen-Informatics-Learning-Center-Back-End
npm install
```
    
    

### 2\. Configure Environment Variables

The application requires several environment variables to run correctly.

1.  Create a new file named `.env` in the root of the project.
    
2.  Copy the contents of `.env.example` into your new `.env` file.
    
3.  Fill in the values for each variable as described below.
    

#### Variable Reference

| **Variable** | **Description** | **Example Value** |
| --- | --- | --- |
| **API Server** | | |
| `PORT` | The port the application will run on. | `3000` |
| `HOST_NAME` | The public-facing URL of the application. | `http://localhost` |
| `CORS_ORIGIN` | The URL of the front-end client that will be making requests. | `http://localhost:5173` |
| **PostgreSQL** | | |
| `DATABASE_URL` | Connection URL to connect to the database. | `postgresql://postgres:root@localhost:5432/sim_ilc` |
| **JWT** | | |
| `JWT_SECRET_KEY` | A long, random, secret string used to sign tokens. **Generate one using `openssl rand -hex 32`**. | `a1b2c3...` |
| `JWT_EXP` | How long a token is valid for (e.g., "7d", "24h"). | `7d` |
| **Redis** | | |
| `REDIS_URL` | Connection URL to connect to redis database. | `redis://default:root@localhost:6379/0` |
| **Nodemailer (Gmail)** | | |
| `NODEMAILER_SENDER` | Verified sender identity. | `mail@similc.co` |
| `NODEMAILER_USER` | Mailer service credential. | `youremail@mail.com` |
| `NODEMAILER_PASS` | Mailer service credential (usually secret key). | `your_secret_key` |
| `NODEMAILER_HOST` | Hostname for your mailer service. | `smtp.sendgrid.net` |
| `NODEMAILER_PORT` | Mailer service port. | `587` or `465` |
| **S3 (MinIO)** | | |
| `S3_REGION` | The default region for your S3 bucket. | `us-east-1` |
| `S3_ENDPOINT` | The full URL for your S3-compatible service. | `http://localhost:9000` |
| `S3_ACCESS_KEY_ID` | The access key for your MinIO/S3 service. | `minioadmin` |
| `S3_SECRET_ACCESS_KEY` | The secret key for your MinIO/S3 service. | `minioadmin` |
| `S3_BUCKET_NAME` | The name of the bucket where files will be stored. | `sim-ilc` |
| `S3_TEST_BUCKET_NAME` | A separate bucket name for running tests. | `sim-ilc-test` |

### 3\. Set Up the Database

After configuring your `.env` file with your database credentials, you need to create the database and run the migrations.

```bash
# Create the database defined in your .env file
# with psql
CREATE DATABASE sim_ilc;

# Run all pending migrations to create the tables
npm run db:migrate
```

### 4\. Run the Application

You can now start the application in development mode. This will use `nodemon` to automatically restart the server when you make changes to the code.

```bash
npm run start:dev
```

The server will be running at [**http://localhost:3000**](http://localhost:3000) (or the port you specified in `.env`).

Running Tests
-------------

The project includes a comprehensive suite of unit and integration tests.

*   **Run all tests:**
    ```bash
    npm run test

    # or the silent version
    npm run -s test:clean
    ```

*   **Run only unit tests:**
    ```bash
    npm run test:unit
    ```
    
*   **Run only integration tests:**    
    ```bash
    npm run test:integration

    # or the silent version
    npm run -s test:integration:clean
    ```

API Documentation
-----------------

*   **Postman**: A comprehensive API documentation is available on Postman.
    
    *   [**View Postman Documentation**](https://documenter.getpostman.com/view/37947000/2sB3HtFGYu)
        
*   **Swagger**: Once the application is running, you can view the Swagger UI documentation at:
    
    *   [**http://localhost:3000/api/v1/docs**](http://localhost:3000/api/v1/docs)
        

Project Structure
-----------------

    .
    ├── docs/                 # API documentation and project diagrams
    ├── scripts/              # Automation scripts for database and Docker
    │   └── db/               # Database scripts
    ├── src/                  # Source code
    │   ├── apis/             # Configuration files for external APIs.
    │   ├── configs/          # Configuration files for database, Redis, S3, etc.
    │   ├── controllers/      # Express controllers for handling requests
    │   ├── db/               # Database utilities
    │   │   ├── migrations/   # Database migrations
    │   │   ├── models/       # Database models
    │   │   └── seeders/      # Database seeders
    │   │       └── factories/# Database factories
    │   ├── middlewares/      # Custom Express middlewares
    │   ├── routes/           # Express routes
    │   ├── services/         # Business logic
    │   ├── templates/        # HTML templates
    │   ├── utils/            # Utility/helper functions
    │   ├── validations/      # Joi validation schemas
    │   ├── app.js            # Express application setup
    │   ├── server.js         # Server entry point
    │   └── swagger.json      # Swagger documentation JSON file
    ├── tests/                # Unit and integration tests
    ├── .env.example          # Example environment variables
    ├── compose.yaml          # Docker Compose configuration
    ├── Dockerfile            # Dockerfile for the API service
    └── package.json          # Project metadata and dependencies
    
