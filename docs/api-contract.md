# Sistem Informasi Manajemen Informatics Learning Center API Contract

An internal Node.js/Express API for the Informatics Learning Center project. It provides endpoints to manage users, authentication, programs, enrollments, payments/invoices, certificates, discussions, feedback, and related admin workflows.

## REST API Endpoints

### User Authentication Management

| Method   | URL                                                             | Functionality                                | Authentication | Authorization |
| -------- | --------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `POST`   | `/api/v1/auth/register`                                         | Registers a new user account                 | Not required   | Any           |
| `POST`   | `/api/v1/auth/login`                                            | Logs in a user account                       | Required       | Self          |
| `POST`   | `/api/v1/auth/logout`                                           | Logs out a user account                      | Required       | Self          |
| `POST`   | `/api/v1/auth/forgot-password`                                  | Sends an email with a URL to reset password  | Not required   | Any           |
| `POST`   | `/api/v1/auth/reset-password`                                   | Resets password of a user account            | Required       | Self          |

### User Profile Management

| Method   | URL                                                             | Functionality                                | Authentication | Authorization |
| -------- | --------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `GET`    | `/api/v1/users`                                                 | Retrieves all user data                      | Required       | Admin         |
| `GET`    | `/api/v1/users/{userId}`                                        | Retrieves a user data                        | Required       | Self          |
| `PATCH`  | `/api/v1/users/{userId}`                                        | Updates a user data                          | Required       | Self          |
| `DELETE` | `/api/v1/users/{userId}`                                        | Deletes a user account                       | Required       | Self          |
| `PUT`    | `/api/v1/users/{userId}/profilePhotos`                          | Uploads a profile picture                    | Required       | Self          |

### Feedback Management

| Method   | URL                                                             | Functionality                                | Authentication | Authorization |
| -------- | --------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `GET`    | `/api/v1/feedbacks`                                             | Retrieves all feedbacks                      | Required       | Admin         |
| `GET`    | `/api/v1/feedbacks/{feedbackId}`                                | Retrieves a feedback details                 | Required       | Admin         |
| `POST`   | `/api/v1/feedbacks`                                             | Creates/sends a feedback                     | Not required   | Any           |
| `POST`   | `/api/v1/feedbacks/{feedbackId}/responses`                      | Responds to a feedback                       | Required       | Admin         |

### Program Management

| Method   | URL                                                             | Functionality                                | Authentication | Authorization |
| -------- | --------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `GET`    | `/api/v1/programs`                                              | Retrieves all programs                       | Not required   | Any           |
| `GET`    | `/api/v1/programs/{programId}`                                  | Retrieves a program details                  | Required       | Any           |
| `POST`   | `/api/v1/programs`                                              | Creates a new program                        | Required       | Admin         |
| `PATCH`  | `/api/v1/programs/{programId}`                                  | Updates a program                            | Required       | Admin         |
| `DELETE` | `/api/v1/programs/{programId}`                                  | Deletes a program                            | Required       | Admin         |
| `PUT`    | `/api/v1/programs/{programId}/thumbnails`                       | Uploads a program thumbnail                  | Required       | Admin         |
| `GET`    | `/api/v1/programs/{programId}/modules`                          | Retrieves all modules                        | Required       | Any           |
| `GET`    | `/api/v1/programs/{programId}/modules/{moduleId}`               | Retrieves a module details                   | Required       | Any           |
| `POST`   | `/api/v1/programs/{programId}/modules`                          | Creates a new module                         | Required       | Admin         |
| `PATCH`  | `/api/v1/programs/{programId}/modules/{moduleId}`               | Updates a module                             | Required       | Admin         |
| `DELETE` | `/api/v1/programs/{programId}/modules/{moduleId}`               | Deletes a module                             | Required       | Admin         |
| `PUT`    | `/api/v1/programs/{programId}/modules/{moduleId}/materials`     | Uploads a module material                    | Required       | Admin         |

### Enrollment Management

| Method   | URL                                                             | Functionality                                | Authentication | Authorization |
| -------- | --------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `GET`    | `/api/v1/enrollments`                                           | Retrieves all enrollments                    | Required       | Self          |
| `GET`    | `/api/v1/enrollments/{enrollmentId}`                            | Retrieves an enrollment details              | Required       | Self          |
| `POST`   | `/api/v1/enrollments`                                           | Creates an enrollment/enroll to a program    | Required       | Self          |
| `PATCH`  | `/api/v1/enrollments/{enrollmentId}`                            | Updates an enrollment                        | Required       | Self          |
| `DELETE` | `/api/v1/enrollments/{enrollmentId}`                            | Deletes an enrollment                        | Required       | Admin         |
| `POST`   | `/api/v1/enrollments/{enrollmentId}/completed-modules`          | Mark a module as completed                   | Required       | Self          |

### Invoice Management

| Method   | URL                                                             | Functionality                                | Authentication | Authorization |
| -------- | --------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `GET`    | `/api/v1/invoices`                                              | Retrieves all invoices                       | Required       | Self          |
| `GET`    | `/api/v1/invoices/{invoiceId}`                                  | Retrieves an invoice details                 | Required       | Self          |
| `DELETE` | `/api/v1/invoices/{invoiceId}`                                  | Deletes an invoice                           | Required       | Admin         |
| `POST`   | `/api/v1/invoices/{invoiceId}/payments`                         | Creates a payment                            | Required       | Self          |

### Certificate Management

| Method   | URL                                                             | Functionality                                | Authentication | Authorization |
| -------- | --------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `GET`    | `/api/v1/certificates`                                          | Retrieves all certificates                   | Required       | Self          |
| `GET`    | `/api/v1/certificates/{certificateId}`                          | Retrieves a certificate details              | Required       | Self          |
| `POST`   | `/api/v1/certificates`                                          | Creates a certificate                        | Required       | Admin         |
| `PATCH`  | `/api/v1/certificates/{certificateId}`                          | Updates a certificate                        | Required       | Admin         |
| `DELETE` | `/api/v1/certificates/{certificateId}`                          | Deletes a certificate                        | Required       | Admin         |

### Discussion Management

| Method   | URL                                                             | Functionality                                | Authentication | Authorization |
| -------- | --------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `GET`    | `/api/v1/discussions`                                           | Retrieves all discussion forums              | Required       | Any           |
| `GET`    | `/api/v1/discussions/{discussionId}`                            | Retrieves a discussion forum details         | Required       | Any           |
| `POST`   | `/api/v1/discussions`                                           | Creates a discussion forum                   | Required       | Admin         |
| `PATCH`  | `/api/v1/discussions/{discussionId}`                            | Updates a discussion forum                   | Required       | Admin         |
| `DELETE` | `/api/v1/discussions/{discussionId}`                            | Deletes a discussion forum                   | Required       | Admin         |
| `GET`    | `/api/v1/discussions/{discussionId}/comments`                   | Retrieves all comments in a discussion forum | Required       | Any           |
| `GET`    | `/api/v1/discussions/{discussionId}/comments/{commentId}`       | Retrieves a comment details                  | Required       | Any           |
| `POST`   | `/api/v1/discussions/{discussionId}/comments`                   | Post a comment to a discussion               | Required       | Any           |
| `PATCH`  | `/api/v1/discussions/{discussionId}/comments/{commentId}`       | Updates a comment                            | Required       | Self          |
| `DELETE` | `/api/v1/discussions/{discussionId}/comments/{commentId}`       | Deletes a comment                            | Required       | Self          |
| `POST`   | `/api/v1/discussions/{discussionId}/comments/{commentId}/likes` | Likes a comment                              | Required       | Any           |
| `DELETE` | `/api/v1/discussions/{discussionId}/comments/{commentId}/likes` | Unlikes a comment                            | Required       | Any           |
