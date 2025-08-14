# Sistem Informasi Manajemen Informatics Learning Center API Contract

## Endpoints

| Method   | URL                                                              | Functionality                                | Authentication | Authorization |
| -------- | ---------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------- |
| `POST`   | `/api/v1/auth/register`                                          | Registers a new user account                 | Not required   | Any           |
| `POST`   | `/api/v1/auth/login`                                             | Logs in a user account                       | Required       | Self          |
| `POST`   | `/api/v1/auth/logout`                                            | Logs out a user account                      | Required       | Self          |
| `POST`   | `/api/v1/auth/forgot-password`                                   | Sends an email with a URL to reset password  | Not required   | Self          |
| `POST`   | `/api/v1/auth/reset-password`                                    | Resets password of a user account            | Required       | Self          |
| `GET`    | `/api/v1/users`                                                  | Retrieves all user data                      | Required       | Admin         |
| `GET`    | `/api/v1/users/{userId}`                                         | Retrieves a user data                        | Required       | Self          |
| `PATCH`  | `/api/v1/users/{userId}`                                         | Updates a user data                          | Required       | Self          |
| `DELETE` | `/api/v1/users/{userId}`                                         | Deletes a user account                       | Required       | Self          |
| `POST`   | `/api/v1/users/{userId}/picture`                                 | Uploads a profile picture                    | Required       | Self          |
| `GET`    | `/api/v1/enrollments`                                            | Retrieves all enrollments                    | Required       | Self          |
| `GET`    | `/api/v1/enrollments/{enrollmentId}`                             | Retrieves an enrollment details              | Required       | Self          |
| `POST`   | `/api/v1/enrollments`                                            | Creates an enrollment/enroll to a program    | Required       | Self          |
| `PATCH`  | `/api/v1/enrollments/{enrollmentId}`                             | Updates an enrollment                        | Required       | Self          |
| `DELETE` | `/api/v1/enrollments/{enrollmentId}`                             | Deletes an enrollment                        | Required       | Admin         |
| `POST`   | `/api/v1/enrollments/{enrollmentId}/completed-modules`           | Mark a module as completed                   | Required       | Self          |
| `GET`    | `/api/v1/certificates`                                           | Retrieves all certificates                   | Required       | Self          |
| `GET`    | `/api/v1/certificates/{certificateId}`                           | Retrieves a certificate details              | Required       | Self          |
| `POST`   | `/api/v1/certificates`                                           | Creates a certificate                        | Required       | Admin         |
| `PATCH`  | `/api/v1/certificates/{certificateId}`                           | Updates a certificate                        | Required       | Admin         |
| `DELETE` | `/api/v1/certificates/{certificateId}`                           | Deletes a certificate                        | Required       | Admin         |
| `GET`    | `/api/v1/invoices`                                               | Retrieves all invoices                       | Required       | Self          |
| `GET`    | `/api/v1/invoices/{invoiceId}`                                   | Retrieves an invoice details                 | Required       | Self          |
| `POST`   | `/api/v1/invoices`                                               | Creates an invoice                           | Required       | Admin         |
| `PATCH`  | `/api/v1/invoices/{invoiceId}`                                   | Updates an invoice                           | Required       | Admin         |
| `DELETE` | `/api/v1/invoices/{invoiceId}`                                   | Deletes an invoice                           | Required       | Admin         |
| `POST`   | `/api/v1/invoices/{invoiceId}/payments`                          | Creates a payment                            | Required       | Self          |
| `PATCH`  | `/api/v1/invoices/{invoiceId}/payments/{paymentId}`              | Updates a payment                            | Required       | Admin         |
| `DELETE` | `/api/v1/invoices/{invoiceId}/payments/{paymentId}`              | Deletes a payment                            | Required       | Admin         |
| `GET`    | `/api/v1/programs`                                               | Retrieves all programs                       | Not required   | Any           |
| `GET`    | `/api/v1/programs/{programId}`                                   | Retrieves a program details                  | Not required   | Any           |
| `POST`   | `/api/v1/programs`                                               | Creates a new program                        | Required       | Admin         |
| `PATCH`  | `/api/v1/programs/{programId}`                                   | Updates a program                            | Required       | Admin         |
| `DELETE` | `/api/v1/programs/{programId}`                                   | Deletes a program                            | Required       | Admin         |
| `GET`    | `/api/v1/programs/{programId}/modules`                           | Retrieves all modules                        | Required       | Any           |
| `GET`    | `/api/v1/programs/{programId}/modules/{moduleId}`                | Retrieves a module details                   | Required       | Any           |
| `POST`   | `/api/v1/programs/{programId}/modules`                           | Creates a module                             | Required       | Admin         |
| `PATCH`  | `/api/v1/programs/{programId}/modules/{moduleId}`                | Updates a module                             | Required       | Admin         |
| `DELETE` | `/api/v1/programs/{programId}/modules/{moduleId}`                | Deletes a module                             | Required       | Admin         |
| `GET`    | `/api/v1/discussions`                                            | Retrieves all discussion forums              | Required       | Any           |
| `GET`    | `/api/v1/discussions/{discussionId}`                             | Retrieves a discussion forum details         | Required       | Any           |
| `POST`   | `/api/v1/discussions`                                            | Creates a discussion forum                   | Required       | Admin         |
| `PATCH`  | `/api/v1/discussions/{discussionId}`                             | Updates a discussion forum                   | Required       | Admin         |
| `DELETE` | `/api/v1/discussions/{discussionId}`                             | Deletes a discussion forum                   | Required       | Admin         |
| `GET`    | `/api/v1/discussions/{discussionId}/comments`                    | Retrieves all comments in a discussion forum | Required       | Any           |
| `GET`    | `/api/v1/discussions/{discussionId}/comments/{commentId}`        | Retrieves a comment details                  | Required       | Any           |
| `POST`   | `/api/v1/discussions/{discussionId}/comments`                    | Post a comment to a discussion               | Required       | Any           |
| `PATCH`  | `/api/v1/discussions/{discussionId}/comments/{commentId}`        | Updates a comment                            | Required       | Self          |
| `DELETE` | `/api/v1/discussions/{discussionId}/comments/{commentId}`        | Deletes a comment                            | Required       | Self          |
| `POST`   | `/api/v1/discussions/{discussionId}/comments/{commentId}/reply`  | Replies to a comment                         | Required       | Any           |
| `POST`   | `/api/v1/discussions/{discussionId}/comments/{commentId}/like`   | Likes a comment                              | Required       | Any           |
| `POST`   | `/api/v1/discussions/{discussionId}/comments/{commentId}/unlike` | Unlikes a comment                            | Required       | Any           |
| `GET`    | `/api/v1/feedbacks`                                              | Retrieves all feedbacks                      | Required       | Admin         |
| `GET`    | `/api/v1/feedbacks/{feedbackId}`                                 | Retrieves a feedback details                 | Required       | Admin         |
| `POST`   | `/api/v1/feedbacks`                                              | Creates/send a feedback                      | Not required   | Any           |

---

## Request/Response Examples

- `POST /api/v1/auth/register` - Registers a new user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/register \
	    -H "Content-Type: application/json" \
	    -d '{
			"fullName": "John Doe",
			"email": "johndoe@mail.com",
			"password": "Weakpassword321"
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully registered a new user account.",
		"data": {
			"user": {
				"id": 1,
				"email": "johndoe@mail.com",
				"fullName": "John Doe",
				"memberLevel": "Basic",
				"role": "User",
				"pictureUrl": null,
				"createdAt": "2025-06-06T08:08:00.080Z",
				"updatedAt": "2025-06-06T08:08:00.080Z"
			}
		},
		"errors": null
	}
	```

- `POST /api/v1/auth/login` - Logs in a user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/login \
		-H "Content-Type: application/json" \
		-d '{
			"email": "johndoe@mail.com",
			"password": "Weakpassword321"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully logged in.",
		"data": {
			"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzNDU2Nzg5LCJuYW1lIjoiSm9zZXBoIn0.OpOSSw7e485LOP5PrzScxHb7SR6sAOMRckfFwi4rp7o"
		},
		"errors": null
	}
	```

- `POST /api/v1/auth/logout` - Logs out a user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/logout \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully logged out.",
		"data": null,
		"errors": null
	}
	```

- `POST /api/v1/auth/forgot-password` - Sends an email with a URL to reset password

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
		-H "Content-Type: application/json" \
		-d '{
			"email": "johndoe@mail.com"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
	    "statusCode": 200,
	    "message": "Successfully sent password reset link to your email.",
	    "data": null,
	    "errors": null
	}
	```

- `POST /api/v1/auth/reset-password` - Resets password of a user account

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/auth/reset-password \
		-H "Content-Type: application/json" \
		-d '{
			"token": "704c1ece2588f9a407053d488b2d2df58a8c1843c16c38fd5206a30917a93e6a",
			"newPassword": "newpassword",
			"confirmNewPassword": "newpassword"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully reset your password.",
		"data": null,
		"errors": null
	}
	```

- `GET /api/v1/users` - Retrieves all user data

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users?limit=10&page=1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all user data.",
		"data": {
			"users": [
				{
					"id": 1,
					"email": "johndoe@mail.com",
					"fullName": "John Doe",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-06T08:08:00.080Z",
					"updatedAt": "2025-06-06T08:08:00.080Z"
				},
				{
					"id": 2,
					"email": "janedoe@mail.com",
					"fullName": "Jane Doe",
					"memberLevel": "Basic",
					"role": "Admin",
					"pictureUrl": null,
					"createdAt": "2025-06-07T09:10:00.080Z",
					"updatedAt": "2025-06-07T09:10:00.080Z"
				},
				{
					"id": 3,
					"email": "alice@mail.com",
					"fullName": "Alice Smith",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-08T10:20:00.080Z",
					"updatedAt": "2025-06-08T10:20:00.080Z"
				},
				{
					"id": 4,
					"email": "bob@mail.com",
					"fullName": "Bob Johnson",
					"memberLevel": "Premium",
					"role": "User",
					"pictureUrl": "https://static.image.com/image.png",
					"createdAt": "2025-06-09T11:30:00.080Z",
					"updatedAt": "2025-06-10T01:30:00.000Z"
				},
				{
					"id": 5,
					"email": "charlie@mail.com",
					"fullName": "Charlie Brown",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-10T12:40:00.080Z",
					"updatedAt": "2025-06-10T12:40:00.080Z"
				},
				{
					"id": 6,
					"email": "david@mail.com",
					"fullName": "David Lee",
					"memberLevel": "Premium",
					"role": "User",
					"pictureUrl": "https://static.image.com/image2.png",
					"createdAt": "2025-06-11T13:50:00.080Z",
					"updatedAt": "2025-06-11T14:50:00.080Z"
				},
				{
					"id": 7,
					"email": "eva@mail.com",
					"fullName": "Eva Green",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-12T14:00:00.080Z",
					"updatedAt": "2025-06-12T14:00:00.080Z"
				},
				{
					"id": 8,
					"email": "frank@mail.com",
					"fullName": "Frank Miller",
					"memberLevel": "Premium",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-13T15:10:00.080Z",
					"updatedAt": "2025-06-13T15:10:00.080Z"
				},
				{
					"id": 9,
					"email": "grace@mail.com",
					"fullName": "Grace Hopper",
					"memberLevel": "Basic",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-14T16:20:00.080Z",
					"updatedAt": "2025-06-14T16:20:00.080Z"
				},
				{
					"id": 10,
					"email": "henry@mail.com",
					"fullName": "Henry Ford",
					"memberLevel": "Premium",
					"role": "User",
					"pictureUrl": null,
					"createdAt": "2025-06-15T17:30:00.080Z",
					"updatedAt": "2025-06-15T17:30:00.080Z"
				}
			]
		},
		"pagination": {
			"currentRecords": 10,
			"totalRecords": 40,
			"currentPage": 1,
			"totalPages": 4,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/users/{userId}` - Retrieves a user data

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved user data.",
		"data": {
			"user": {
				"id": 1,
				"email": "johndoe@mail.com",
				"fullName": "John Doe",
				"memberLevel": "Basic",
				"role": "User",
				"pictureUrl": null,
				"createdAt": "2025-06-06T08:08:00.080Z",
				"updatedAt": "2025-06-06T08:08:00.080Z"
			}
		},	
		"errors": null
	}
	```

- `PATCH /api/v1/users/{userId}` - Updates a user data

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/users/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"fullName": "Joko Doe"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully updated user data.",
		"data": {
			"user": {
				"id": 1,
				"email": "johndoe@mail.com",
				"fullName": "Joko Doe",
				"memberLevel": "Basic",
				"role": "User",
				"pictureUrl": null,
				"createdAt": "2025-06-06T08:08:00.080Z",
				"updatedAt": "2025-06-09T00:00:00.000Z"
			}
		},	
		"errors": null
	}
	```

- `POST /api/v1/users/{userId}/picture` - Uploads a profile picture

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/users/1/picture \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-F "picture=@/path/to/profile.jpg"
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully uploaded a profile picture.",
		"data": {
			"pictureUrl": "https://static.image.com/profile-user1.png"
		},	
		"errors": null
	}
	```

- `DELETE /api/v1/users/{userId}` - Deletes a user account

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/users/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted a user account.",
		"data": null,	
		"errors": null
	}
	```

- `GET /api/v1/enrollments` - Retrieves all enrollments

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/enrollments?userId=1&type=Course&sort=-updatedAt&limit=5&page=1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all program enrollments.",
		"data": {
			"enrollments": [
				{
					"id": 1,
					"userId": 1,
					"program": {
						"id": 3,
						"title": "VueJS untuk Pemula",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p3.png"
					},
					"progressPercentage": 80.00,
					"status": "In Progress",
					"completedAt": null,
					"createdAt": "2025-12-31T08:00:00.069Z",
					"updatedAt": "2026-01-01T12:12:12.121Z"
				},
				{
					"id": 5,
					"userId": 1,
					"program": {
						"id": 9,
						"title": "DevOps Fundamental",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p9.png"
					},
					"progressPercentage": 20.00,
					"status": "In Progress",
					"completedAt": null,
					"createdAt": "2025-12-25T13:00:00.000Z",
					"updatedAt": "2025-12-31T09:00:00.000Z"
				},
				{
					"id": 2,
					"userId": 1,
					"program": {
						"id": 5,
						"title": "ReactJS Lanjutan",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p5.png"
					},
					"progressPercentage": 100.00,
					"status": "Completed",
					"completedAt": "2025-12-30T10:00:00.000Z",
					"createdAt": "2025-12-01T09:00:00.000Z",
					"updatedAt": "2025-12-30T10:00:00.000Z"
				},
				{
					"id": 3,
					"userId": 1,
					"program": {
						"id": 7,
						"title": "Dasar Pemrograman Python",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p7.png"
					},
					"progressPercentage": 60.00,
					"status": "In Progress",
					"completedAt": null,
					"createdAt": "2025-12-15T08:30:00.000Z",
					"updatedAt": "2025-12-28T14:00:00.000Z"
				},
				{
					"id": 4,
					"userId": 1,
					"program": {
						"id": 2,
						"title": "Machine Learning Dasar",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p2.png"
					},
					"progressPercentage": 100.00,
					"status": "Completed",
					"completedAt": "2025-12-20T16:45:00.000Z",
					"createdAt": "2025-11-20T10:00:00.000Z",
					"updatedAt": "2025-12-20T16:45:00.000Z"
				}
			]
		},
		"pagination": {
			"currentRecords": 5,
			"totalRecords": 10,
			"currentPage": 1,
			"totalPages": 2,
			"nextPage": 2,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/enrollments/{enrollmentId}` - Retrieves an enrollment details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/enrollments/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved program enrollment details.",
		"data": {
			"enrollment": {
				"id": 1,
				"userId": 1,
				"program": {
					"id": 3,
					"title": "VueJS untuk Pemula",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p3.png"
				},
				"progressPercentage": 80.00,
				"status": "In Progress",
				"completedAt": null,
				"completedModules": [
					{
						"moduleId": 23,
						"completedAt": "2025-12-31T09:00:00.069Z"
					},
					{
						"moduleId": 24,
						"completedAt": "2025-12-31T10:00:00.069Z"
					},
					{
						"moduleId": 25,
						"completedAt": "2025-12-31T11:00:00.069Z"
					},
					{
						"moduleId": 26,
						"completedAt": "2026-01-01T12:12:12.121Z"
					}
				],
				"createdAt": "2025-12-31T08:00:00.069Z",
				"updatedAt": "2026-01-01T12:12:12.121Z"
			}
		},
		"errors": null
	}
	```


- `POST /api/v1/enrollments` - Creates an enrollment/enrolls to a program

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/enrollments \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"programId": 3
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully created an enrollment. Please complete the payment to access the contents.",
		"data": {
			"enrollment": {
				"id": 1,
				"userId": 1,
				"program": {
					"id": 3,
					"title": "VueJS untuk Pemula",
					"type": "Course",
					"thumbnailUrl": "https://static.image.com/thumb_p3.png"
				},
				"progressPercentage": 0.00,
				"status": "Unpaid",
				"completedAt": null,
				"createdAt": "2025-12-31T08:00:00.069Z",
				"updatedAt": "2025-12-31T08:00:00.069Z"
			},
			"invoice": {
				"id": 1,
				"virtualAccountNumber": "1234279807578",
				"amountIdr": 150000.00,
				"paymentDueDatetime": "2025-12-31T23:59:59.999"
			}
		},
		"errors": null
	}
	```

- `PATCH /api/v1/enrollments/{enrollmentId}` - Updates an enrollment

	- Request:

	```bash
	curl -X PATCH http://localhost:3000/api/v1/enrollments/3 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"status": "Completed"
		}'
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully updated program enrollment details.",
		"data": {
			"enrollment": {
				"id": 3,
				"userId": 1,
				"program": {
					"id": 19,
					"title": "AI Ethics Seminar",
					"type": "Seminar",
					"thumbnailUrl": "https://static.image.com/thumb_p19.png"
				},
				"progressPercentage": 100.00,
				"status": "Completed",
				"completedAt": "2026-01-01T12:12:12.121Z",
				"createdAt": "2025-12-31T08:00:00.069Z",
				"updatedAt": "2026-01-01T12:12:12.121Z"
			}
		},
		"errors": null
	}
	```

- `DELETE /api/v1/enrollments/{enrollmentId}` - Deletes an enrollment

	- Request:

	```bash
	curl -X DELETE http://localhost:3000/api/v1/enrollments/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully deleted an enrollment.",
		"data": null,
		"errors": null
	}
	```

- `POST /api/v1/enrollments/{enrollmentId}/completed-modules` - Mark a module as completed. Only works on programs with "Course" type

	- Request:

	```bash
	curl -X POST http://localhost:3000/api/v1/enrollments/1/completed-modules \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
		-H "Content-Type: application/json" \
		-d '{
			"moduleId": 23
		}'
	```

	- Response (201):

	```json
	{
		"success": true,
		"statusCode": 201,
		"message": "Successfully completed a module.",
		"data": {
			"completedModule": {
				"id": 200,
				"moduleId": 23,
				"completedAt": "2025-12-31T09:00:00.000Z"
			}
		},
		"errors": null
	}
	```

- `GET /api/v1/certificates` - Retrieves all certificates

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users/1/certificates?userId=1&limit=5&page=1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved all certificates.",
		"data": {
			"certificates": [
				{
					"id": 1,
					"userId": 1,
					"enrollmentId": 1,
					"program": {
						"id": 3,
						"title": "VueJS untuk Pemula",
						"type": "Course",
						"thumbnailUrl": "https://static.image.com/thumb_p3.png"
					},
					"title": "VueJS untuk Pemula Certificate of Completion",
					"issuedAt": "2025-12-09T12:45:55.091Z",
					"documentUrl": "https://example.storage.com/cert/frontend0119999.pdf"
				},
				{
					"id": 2,
					"userId": 1,
					"enrollmentId": 2,
					"title": "Back-End Web Development Certificate of Completion",
					"issuedAt": "2025-12-14T11:00:00.000Z",
					"documentUrl": "https://example.storage.com/cert/backend0119119.pdf"
				},
				{
					"id": 3,
					"userId": 1,
					"enrollmentId": 3,
					"title": "Machine Learning Dasar Certificate of Completion",
					"issuedAt": "2025-12-01T12:30:30.111Z",
					"documentUrl": "https://example.storage.com/cert/machinelearningdasar013214.pdf"
				},
				{
					"id": 4,
					"userId": 1,
					"enrollmentId": 4,
					"title": "Pemrograman Python Dasar Certificate of Completion",
					"issuedAt": "2025-11-21T09:09:09.009Z",
					"documentUrl": "https://example.storage.com/cert/pythondasar01192315.pdf"
				},
				{
					"id": 5,
					"userId": 1,
					"enrollmentId": 5,
					"title": "Pemrograman Java Dasar Certificate of Completion",
					"issuedAt": "2025-11-22T09:09:09.009Z",
					"documentUrl": "https://example.storage.com/cert/javadasar011912312.pdf"
				}
			]
		},
		"pagination": {
			"currentRecords": 5,
			"totalRecords": 5,
			"currentPage": 1,
			"totalPages": 1,
			"nextPage": null,
			"prevPage": null
		},
		"errors": null
	}
	```

- `GET /api/v1/certificates/{certificateId}` - Retrieves a certificate details

	- Request:

	```bash
	curl -X GET http://localhost:3000/api/v1/users/1/certificates/1 \
		-H "Authorization: Bearer $YOUR_ACCESS_TOKEN"
	```

	- Response (200):

	```json
	{
		"success": true,
		"statusCode": 200,
		"message": "Successfully retrieved a certificate.",
		"data": {
			"certificate": {
				"id": 1,
				"enrollmentId": 1,
				"title": "Front-End Web Development Certificate of Completion",
				"credential": "lWNxvj5QTleAEF0PsniDug",
				"issuedAt": "2025-12-09T12:45:55.091Z",
				"expiredAt": "2030-12-09T12:45:55.091Z",
				"documentUrl": "https://example.storage.com/cert/frontend0119999.pdf"
			}
		},
		"errors": null
	}
	```

